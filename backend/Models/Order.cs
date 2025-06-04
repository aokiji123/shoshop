using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Order
{
    [Key]
    public Guid Id { get; set; }
    
    [Required, MaxLength(100)]
    public string TgTag { get; set; }
    
    [Required]
    public decimal Price { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
    
    public ICollection<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}