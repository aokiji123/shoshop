using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class User
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required, MaxLength(255)]
    public string Name { get; set; }
    
    [Required, MaxLength(255), EmailAddress]
    public string Email { get; set; }
    
    [Required, MaxLength(255)]
    public string Password { get; set; }
    
    [Required]
    public bool IsAdmin { get; set; } = false;
    
    [MaxLength(3000)]
    public string? Image { get; set; } // URL or local path
    
    // TgTag and Orders db update
    
    [MaxLength(100)]
    public string? TgTag { get; set; }
    
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    
    // Likes db update
    
    public ICollection<UserProductLike> LikedProducts { get; set; } = new List<UserProductLike>();
}