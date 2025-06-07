namespace backend.DTOs.Orders;

public class DefaultOrderDto
{
    public string TgTag { get; set; } = string.Empty;
    public Guid UserId { get; set; }
}