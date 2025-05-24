using System.ComponentModel.DataAnnotations;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/product")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly DataContext _context;
    
    public ProductController(DataContext context) => _context = context;
    
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string UaName { get; set; }
        public string EnName { get; set; }
        public string Description { get; set; }
        public double Price { get; set; }
        public string Category { get; set; }
        public int Count { get; set; }
        public int Likes { get; set; }
        public string Image { get; set; }
    }

    public class CreateUpdateProductDto
    {
        [Required, MaxLength(255)]
        public string UaName { get; set; }

        [Required, MaxLength(255)]
        public string EnName { get; set; }

        [Required]
        public string Description { get; set; }

        [Required, Range(0, double.MaxValue)]
        public double Price { get; set; }

        [Required, MaxLength(100)]
        public string Category { get; set; }

        [Required, Range(0, int.MaxValue)]
        public int Count { get; set; }

        [Range(0, int.MaxValue)]
        public int Likes { get; set; } = 0;

        [Required]
        public string Image { get; set; }
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        var products = await _context.Products
            .Select(p => new ProductDto
            {
                Id = p.Id,
                UaName = p.UaName,
                EnName = p.EnName,
                Description = p.Description,
                Price = p.Price,
                Category = p.Category,
                Count = p.Count,
                Likes = p.Likes,
                Image = p.Image
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
    {
        var product = await _context.Products
            .Select(p => new ProductDto
            {
                Id = p.Id,
                UaName = p.UaName,
                EnName = p.EnName,
                Description = p.Description,
                Price = p.Price,
                Category = p.Category,
                Count = p.Count,
                Likes = p.Likes,
                Image = p.Image
            })
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound("Product not found");

        return Ok(product);
    }

    [HttpGet("popular")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetPopularProduct([FromQuery] int limit = 10)
    {
        if (limit < 1) return BadRequest("Limit must be greater than 0");
        
        var products = await _context.Products
            .OrderByDescending(p => p.Likes)
            .Take(limit)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                UaName = p.UaName,
                EnName = p.EnName,
                Description = p.Description,
                Price = p.Price,
                Category = p.Category,
                Count = p.Count,
                Likes = p.Likes,
                Image = p.Image
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateUpdateProductDto createDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var product = new Product
        {
            UaName = createDto.UaName,
            EnName = createDto.EnName,
            Description = createDto.Description,
            Price = createDto.Price,
            Category = createDto.Category,
            Count = createDto.Count,
            Likes = createDto.Likes,
            Image = createDto.Image
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var productDto = new ProductDto
        {
            Id = product.Id,
            UaName = product.UaName,
            EnName = product.EnName,
            Description = product.Description,
            Price = product.Price,
            Category = product.Category,
            Count = product.Count,
            Likes = product.Likes,
            Image = product.Image
        };

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromBody] CreateUpdateProductDto updateDto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound("Product not found");

        product.UaName = updateDto.UaName;
        product.EnName = updateDto.EnName;
        product.Description = updateDto.Description;
        product.Price = updateDto.Price;
        product.Category = updateDto.Category;
        product.Count = updateDto.Count;
        product.Likes = updateDto.Likes;
        product.Image = updateDto.Image;

        _context.Products.Update(product);
        await _context.SaveChangesAsync();

        var productDto = new ProductDto
        {
            Id = product.Id,
            UaName = product.UaName,
            EnName = product.EnName,
            Description = product.Description,
            Price = product.Price,
            Category = product.Category,
            Count = product.Count,
            Likes = product.Likes,
            Image = product.Image
        };

        return Ok(productDto);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound("Product not found");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Product deleted successfully" });
    }
}