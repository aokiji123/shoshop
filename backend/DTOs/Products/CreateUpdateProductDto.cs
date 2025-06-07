using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;

namespace backend.DTOs.Products;

public class CreateUpdateProductDto
{
    [Required, MaxLength(255)]
    public string UaName { get; set; }

    [Required, MaxLength(255)]
    public string EnName { get; set; }

    [Required]
    public string Description { get; set; }

    [Required, Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Required]
    public ProductCategory Category { get; set; }

    [Required, Range(0, int.MaxValue)]
    public int Count { get; set; }

    [Range(0, int.MaxValue)]
    public int Likes { get; set; } = 0;

    [MaxLength(3000)]
    public string? Image { get; set; }
        
    [Required]
    public ProductSize Size { get; set; }
    
    [Required]
    public ProductColor Color { get; set; }
}