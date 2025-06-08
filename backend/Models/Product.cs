using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;

namespace backend.Models;

public class Product
{
    [Key] 
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(255)] 
    public string UaName { get; set; }
    
    [Required, MaxLength(255)] 
    public string EnName { get; set; }
    
    [Required]
    public string Description { get; set; }
    
    [Required] 
    public decimal Price { get; set; }
    
    [Required] 
    public ProductCategory Category { get; set; }
    
    [Required, Range(0, int.MaxValue)] 
    public int Count { get; set; }
    
    [Range(0, int.MaxValue)] 
    public int Likes { get; set; } = 0;
    
    [MaxLength(3000)]
    public string? Image { get; set; } // URL or local path
    
    // Size and Color db update
    
    [Required]
    public ProductSize Size { get; set; }
    
    [Required]
    public ProductColor Color { get; set; }
    
    // TgTag and Orders db update
    
    public ICollection<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
    
    // Likes db update
    
    public ICollection<UserProductLike> UserLikes { get; set; } = new List<UserProductLike>();
}