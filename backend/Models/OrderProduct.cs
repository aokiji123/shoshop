using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class OrderProduct
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    public Guid OrderId { get; set; }
    
    [ForeignKey(nameof(OrderId))]
    public Order Order { get; set; } = null!;
    
    [Required]
    public Guid ProductId { get; set; }
    
    [ForeignKey(nameof(ProductId))]
    public Product Product { get; set; } = null!;
    
    [Required]
    public int Quantity { get; set; }
    
    [Required]
    public decimal PriceAtTime { get; set; }
}