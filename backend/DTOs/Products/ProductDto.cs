using backend.Models.Enums;

namespace backend.DTOs.Products;

public class ProductDto
{
    public Guid Id { get; set; }
    public string UaName { get; set; }
    public string EnName { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public ProductCategory Category { get; set; }
    public int Count { get; set; }
    public int Likes { get; set; }
    public string Image { get; set; }
    public ProductSize Size { get; set; } 
    public ProductColor Color { get; set; }
}