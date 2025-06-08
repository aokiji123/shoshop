using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AutoMapper;
using backend.DTOs.Orders;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/order")]
public class OrderController : BaseController
{
    private readonly DataContext _context;
    private readonly ILogger<OrderController> _logger;
    private readonly TelegramBotService _telegramBotService;
    private readonly IMapper _mapper;

    public OrderController(DataContext context, ILogger<OrderController> logger, TelegramBotService telegramBotService, IMapper mapper)
    {
        _context = context;
        _logger = logger;
        _telegramBotService = telegramBotService;
        _mapper = mapper;
    }

    /// <summary>
    /// Retrieves a list of all orders
    /// </summary>
    /// <returns>A list of orders</returns>
    /// <response code="200">Returns the list of orders</response>
    /// <response code="401">If the user is not authenticated</response>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<OrderResponseDto>), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderProducts)
            .ThenInclude(op => op.Product)
            .ToListAsync();

        var orderDtos = _mapper.Map<List<OrderResponseDto>>(orders);
        return Ok(orderDtos);
    }

    /// <summary>
    /// Retrieves a specific order by ID
    /// </summary>
    /// <param name="id">The ID of the order</param>
    /// <returns>The order details</returns>
    /// <response code="200">Returns the order</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="404">If the order is not found</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(OrderResponseDto), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 404)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<OrderResponseDto>> GetOrder(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderProducts)
            .ThenInclude(op => op.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        var orderDto = _mapper.Map<OrderResponseDto>(order);

        return Ok(orderDto);
    }

    /// <summary>
    /// Retrieves orders for a specific user
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <returns>A list of user's orders</returns>
    /// <response code="200">Returns the list of user's orders</response>
    /// <response code="401">If the user is not authenticated</response>
    [HttpGet("user/{userId}")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<OrderResponseDto>), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<IEnumerable<OrderResponseDto>>> GetOrdersByUser(Guid userId)
    {
        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderProducts)
            .ThenInclude(op => op.Product)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var orderDtos = _mapper.Map<List<OrderResponseDto>>(orders);

        return Ok(orderDtos);
    }

    /// <summary>
    /// Creates a new order
    /// </summary>
    /// <param name="newOrderDto">The order details to create</param>
    /// <returns>The created order</returns>
    /// <response code="201">Returns the created order</response>
    /// <response code="400">If the input is invalid</response>
    /// <response code="401">If the user is not authenticated</response>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(OrderResponseDto), 201)]
    [ProducesResponseType(typeof(string), 400)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder(CreateOrderDto newOrderDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized("Invalid user ID in token");

            var strategy = _context.Database.CreateExecutionStrategy();
            var result = await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var productIds = newOrderDto.Products.Select(p => p.ProductId).ToList();
                    var products = await _context.Products
                        .Where(p => productIds.Contains(p.Id))
                        .ToDictionaryAsync(p => p.Id, p => p);
                    
                    if (products.Count != productIds.Count)
                    {
                        throw new InvalidOperationException("Some products not found");
                    }

                    var user = await _context.Users.FindAsync(userId);
                    if (user == null) throw new InvalidOperationException("User not found");
                    
                    var order = _mapper.Map<Order>(newOrderDto);
                    order.UserId = userId.Value;
                    order.TgTag = !string.IsNullOrWhiteSpace(newOrderDto.TgTag) 
                        ? newOrderDto.TgTag 
                        : user.TgTag ?? "";

                    if (string.IsNullOrWhiteSpace(order.TgTag)) 
                        throw new InvalidOperationException("TgTag is required for order. Please provide it or set it in your profile");

                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();
                    
                    var orderProducts = newOrderDto.Products.Select(po => {
                        var orderProduct = _mapper.Map<OrderProduct>(po);
                        orderProduct.OrderId = order.Id;
                        orderProduct.PriceAtTime = products[po.ProductId].Price;
                        return orderProduct;
                    }).ToList();

                    _context.OrderProducts.AddRange(orderProducts);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    
                    return order.Id;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            // Fetch the complete order outside the transaction
            var order = await _context.Orders
                .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
                .FirstAsync(o => o.Id == result);

            await _telegramBotService.NotifyAdminsOfNewOrderAsync(order);

            _logger.LogInformation("Order {OrderId} created for user {UserId} with TgTag {TgTag}", 
                order.Id, userId, order.TgTag);
            
            var orderDto = _mapper.Map<OrderResponseDto>(order);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, orderDto);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("products not found"))
        {
            return BadRequest("Some products not found");
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("User not found"))
        {
            return BadRequest("User not found");
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("TgTag is required"))
        {
            return BadRequest("TgTag is required for order. Please provide it or set it in your profile");
        }
        catch (Exception ex)
        {
            return HandleException<OrderResponseDto>(ex, _logger, "CreateOrder");
        }
    }
}