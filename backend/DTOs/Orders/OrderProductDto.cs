namespace backend.DTOs.Orders;

public class OrderProductDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
}