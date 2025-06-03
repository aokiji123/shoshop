namespace backend.QueryObjects;

public class ProductFilter
{
    public string? UaName { get; set; }
    public string? EnName { get; set; }
    public string? Description { get; set; }
    public double? MinPrice { get; set; }
    public double? MaxPrice { get; set; }
    public string? Category { get; set; }
    public int? Count { get; set; }
    public int? Likes { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
}