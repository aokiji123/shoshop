namespace backend.DTOs.Orders;

public class OrderResponseDto
{
    public Guid Id { get; set; }
    public string TgTag { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderProductResponseDto> OrderProducts { get; set; } = new();
}