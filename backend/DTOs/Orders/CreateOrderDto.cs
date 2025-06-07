namespace backend.DTOs.Orders;

public class CreateOrderDto
{
    public string? TgTag { get; set; }
    public decimal Price { get; set; }
    public List<OrderProductDto> Products { get; set; } = new();
}