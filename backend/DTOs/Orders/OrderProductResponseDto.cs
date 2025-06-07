namespace backend.DTOs.Orders;

public class OrderProductResponseDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal PriceAtTime { get; set; }
}