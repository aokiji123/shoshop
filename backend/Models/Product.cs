using System.ComponentModel.DataAnnotations;

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
    public double Price { get; set; }
    
    [Required, MaxLength(100)] 
    public string Category { get; set; }
    
    [Required, Range(0, int.MaxValue)] 
    public int Count { get; set; }
    
    [Range(0, int.MaxValue)] 
    public int Likes { get; set; } = 0;
    
    [Required]
    public string Image { get; set; } // URL or base64; use byte[] for BYTEA
}