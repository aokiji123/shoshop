namespace backend.Services;

public class TelegramBotHostedService : IHostedService
{
    private readonly TelegramBotService _telegramBotService;
    private readonly ILogger<TelegramBotHostedService> _logger;
    private Task _pollingTask;
    private readonly CancellationTokenSource _cts = new();

    public TelegramBotHostedService(TelegramBotService telegramBotService, ILogger<TelegramBotHostedService> logger)
    {
        _telegramBotService = telegramBotService;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting TelegramBotHostedService");
        _pollingTask = Task.Run(() => _telegramBotService.StartAsync(_cts.Token), cancellationToken);
        _logger.LogInformation("TelegramBotHostedService started");
        return Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping TelegramBotHostedService");
        await _cts.CancelAsync();
        if (_pollingTask != null) await _pollingTask;
        _cts.Dispose();
        _logger.LogInformation("TelegramBotHostedService stopped");
    }
}