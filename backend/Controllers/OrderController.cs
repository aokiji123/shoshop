using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/order")]
public class OrderController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<OrderController> _logger;
    private readonly TelegramBotService _telegramBotService;

    public OrderController(DataContext context, ILogger<OrderController> logger, TelegramBotService telegramBotService)
    {
        _context = context;
        _logger = logger;
        _telegramBotService = telegramBotService;
    }
    
    public class DefaultOrderDto
    {
        public string TgTag { get; set; } = string.Empty;
        public Guid UserId { get; set; }
    }

    public class CreateOrderDto
    {
        public string? TgTag { get; set; }
        public decimal Price { get; set; }
        public List<OrderProductDto> Products { get; set; } = new();
    }

    public class OrderProductDto
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }
    
    public class OrderProductResponseDto
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal PriceAtTime { get; set; }
    }
    
    public class OrderResponseDto
    {
        public Guid Id { get; set; }
        public string TgTag { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderProductResponseDto> OrderProducts { get; set; } = new();
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderProducts)
            .ThenInclude(op => op.Product)
            .ToListAsync();

        var orderDtos = orders.Select(o => new OrderResponseDto
        {
            Id = o.Id,
            TgTag = o.TgTag,
            Price = o.Price,
            UserId = o.UserId,
            CreatedAt = o.CreatedAt,
            OrderProducts = o.OrderProducts.Select(op => new OrderProductResponseDto
            {
                ProductId = op.ProductId,
                ProductName = op.Product.EnName,
                Quantity = op.Quantity,
                PriceAtTime = op.PriceAtTime
            }).ToList()
        }).ToList();

        return Ok(orderDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderResponseDto>> GetOrder(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderProducts)
            .ThenInclude(op => op.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        var orderDto = new OrderResponseDto
        {
            Id = order.Id,
            TgTag = order.TgTag,
            Price = order.Price,
            UserId = order.UserId,
            CreatedAt = order.CreatedAt,
            OrderProducts = order.OrderProducts.Select(op => new OrderProductResponseDto
            {
                ProductId = op.ProductId,
                ProductName = op.Product.EnName,
                Quantity = op.Quantity,
                PriceAtTime = op.PriceAtTime
            }).ToList()
        };

        return Ok(orderDto);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetOrdersByUser(Guid userId)
    {
        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderProducts)
            .ThenInclude(op => op.Product)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var orderDtos = orders.Select(o => new OrderResponseDto
        {
            Id = o.Id,
            TgTag = o.TgTag,
            Price = o.Price,
            UserId = o.UserId,
            CreatedAt = o.CreatedAt,
            OrderProducts = o.OrderProducts.Select(op => new OrderProductResponseDto
            {
                ProductId = op.ProductId,
                ProductName = op.Product.EnName,
                Quantity = op.Quantity,
                PriceAtTime = op.PriceAtTime
            }).ToList()
        }).ToList();

        return Ok(orderDtos);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder(CreateOrderDto newOrderDto)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized("Invalid user ID in token");

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return BadRequest("User not found");

        var tgTagToUse = !string.IsNullOrWhiteSpace(newOrderDto.TgTag)
            ? newOrderDto.TgTag
            : user.TgTag ?? "";

        if (string.IsNullOrWhiteSpace(tgTagToUse)) return BadRequest("TgTag is required for order. Please provide it or set it in your profile");

        var order = new Order
        {
            TgTag = tgTagToUse,
            Price = newOrderDto.Price,
            UserId = userId.Value,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        foreach (var productOrder in newOrderDto.Products)
        {
            var product = await _context.Products.FindAsync(productOrder.ProductId);
            if (product != null)
            {
                var orderProduct = new OrderProduct
                {
                    OrderId = order.Id,
                    ProductId = productOrder.ProductId,
                    Quantity = productOrder.Quantity,
                    PriceAtTime = product.Price
                };
                _context.OrderProducts.Add(orderProduct);
            }
        }

        await _context.SaveChangesAsync();
        await _telegramBotService.NotifyAdminsOfNewOrderAsync(order);

        _logger.LogInformation("Order {OrderId} created for user {UserId} with TgTag {TgTag}", order.Id, userId, tgTagToUse);

        var orderDto = new OrderResponseDto
        {
            Id = order.Id,
            TgTag = order.TgTag,
            Price = order.Price,
            UserId = order.UserId,
            CreatedAt = order.CreatedAt,
            OrderProducts = order.OrderProducts.Select(op => new OrderProductResponseDto
            {
                ProductId = op.ProductId,
                ProductName = op.Product?.EnName ?? "Unknown",
                Quantity = op.Quantity,
                PriceAtTime = op.PriceAtTime
            }).ToList()
        };

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, orderDto);
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value;

        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}