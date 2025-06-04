using backend.Models.Enums;

namespace backend.QueryObjects;

public class ProductFilter
{
    public string? UaName { get; set; }
    public string? EnName { get; set; }
    public string? Description { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public ProductCategory? Category { get; set; }
    public int? Count { get; set; }
    public int? Likes { get; set; }
    public ProductSize? Size { get; set; }
    public ProductColor? Color { get; set; }
}