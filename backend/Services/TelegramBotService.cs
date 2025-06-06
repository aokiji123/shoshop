using backend.Data;
using Microsoft.EntityFrameworkCore;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using backend.Models;

namespace backend.Services;

public class TelegramBotService
{
    private readonly ITelegramBotClient _botClient;
    private readonly IServiceProvider _serviceProvider;
    private readonly string? _botToken;
    private readonly ILogger<TelegramBotService> _logger;

    public TelegramBotService(IConfiguration configuration, IServiceProvider serviceProvider, ILogger<TelegramBotService> logger)
    {
        _botToken = configuration["Telegram:BotToken"];
        _serviceProvider = serviceProvider;
        _logger = logger;

        if (string.IsNullOrEmpty(_botToken))
        {
            _logger.LogWarning("Telegram BotToken is not configured. Telegram bot functionality will be disabled");
            _botClient = null;
        }
        else
        {
            try { _botClient = new TelegramBotClient(_botToken); }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize TelegramBotClient. Bot functionality will be disabled");
                _botClient = null;
            }
        }
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (_botClient == null)
        {
            _logger.LogWarning("Telegram bot is not initialized due to missing or invalid BotToken. Skipping bot startup");
            return;
        }

        try
        {
            await _botClient.ReceiveAsync(
                updateHandler: HandleUpdateAsync,
                HandlePollingErrorAsync,
                cancellationToken: cancellationToken);
            _logger.LogInformation("Telegram bot started successfully");
        }
        catch (Exception ex) { _logger.LogError(ex, "Failed to start Telegram bot polling"); }
    }

    public async Task NotifyAdminsOfNewOrderAsync(Order order)
    {
        if (_botClient == null)
        {
            _logger.LogWarning("Telegram bot is not initialized. Skipping order notification");
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();

        var admins = await dbContext.AdminsChats
            .Where(c => !string.IsNullOrEmpty(c.TgTag))
            .ToListAsync(cancellationToken: CancellationToken.None);

        if (!admins.Any())
        {
            _logger.LogWarning("No admins found. Skipping order notification");
            return;
        }

        var orderProducts = await dbContext.OrderProducts
            .Where(op => op.OrderId == order.Id)
            .Include(op => op.Product)
            .ToListAsync(cancellationToken: CancellationToken.None);

        var message = $"*New Order Received!*\n" +
                      $"Order ID: {order.Id}\n" +
                      $"User: {order.TgTag}\n" +
                      $"Total Price: {order.Price:C}\n" +
                      $"Created At: {order.CreatedAt:yyyy-MM-dd HH:mm:ss UTC}\n" +
                      $"Products:\n" +
                      string.Join("\n", orderProducts.Select(op => $"- {op.Product.EnName} (Qty: {op.Quantity})"));

        foreach (var admin in admins)
        {
            var telegramId = admin.TgTag.StartsWith("@") ? admin.TgTag : "@" + admin.TgTag ;
            var chatId = dbContext.AdminsChats.First(c => c.TgTag == telegramId).ChatId;
            try
            {
                await _botClient.SendMessage(
                    chatId: chatId,
                    text: message,
                    parseMode: ParseMode.Markdown,
                    cancellationToken: CancellationToken.None);
                _logger.LogInformation($"Order notification sent to {admin.TgTag}");
            }
            catch (Exception ex) { _logger.LogError(ex, $"Failed to send message to {admin.TgTag}"); }
        }
    }

    private async Task HandleUpdateAsync(ITelegramBotClient botClient, Update update, CancellationToken cancellationToken)
    {
        if (update.Type != UpdateType.Message || update.Message?.Text == null) return;

        var message = update.Message;
        var chatId = message.Chat.Id;
        var username = message.From?.Username;

        if (message.Text == "/start")
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();
            var tgTag = string.IsNullOrEmpty(username) ? null : $"@{username}";
            
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.TgTag == tgTag, cancellationToken);
            
            var chat = await dbContext.AdminsChats.FirstOrDefaultAsync(c => c.TgTag == tgTag || c.ChatId == message.Chat.Id, cancellationToken);
            
            var response = user != null
                ? $"Hello, {user.TgTag}! Your role is: {(user.IsAdmin ? "Admin" : "User")}"
                : "User not found. Please ensure your Telegram tag is registered in the system";
            
            try
            {
                var adminChat = new AdminsChats { TgTag = tgTag, ChatId = message.Chat.Id };
                if (chat == null) dbContext.AdminsChats.Add(adminChat);
                await dbContext.SaveChangesAsync(cancellationToken);
                
                await botClient.SendMessage(
                    chatId: message.Chat.Id,
                    text: response,
                    parseMode: ParseMode.Markdown,
                    cancellationToken: cancellationToken);
            }
            catch (Exception ex) { _logger.LogError(ex, $"Failed to send /start response to chat {chatId}"); }
        }
    }

    private Task HandlePollingErrorAsync(ITelegramBotClient botClient, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Telegram polling error.");
        return Task.CompletedTask;
    }
}