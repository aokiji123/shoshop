using System.ComponentModel.DataAnnotations;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/product")]
[ApiController]
public class ProductController : ControllerBase
{
    private readonly DataContext _context;
    private readonly IImageService _imageService;
    private readonly ILogger<ProductController> _logger;

    public ProductController(DataContext context, IImageService imageService, ILogger<ProductController> logger)
    {
        _context = context;
        _imageService = imageService;
        _logger = logger;
    }
    
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
        public string Size { get; set; } 
        public string Color { get; set; }
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

        [MaxLength(500)]
        public string? Image { get; set; }
        
        [Required, MaxLength(100)]
        public string Size { get; set; }
    
        [Required, MaxLength(100)]
        public string Color { get; set; }
    }

    /// <summary>
    /// Retrieves a list of all products
    /// </summary>
    /// <returns>A list of products</returns>
    /// <response code="200">Returns the list of products</response>
    /// <response code="401">If the user is not authenticated</response>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<ProductDto>), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        try
        {
            _logger.LogInformation("Request to get all products");

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
                    Image = p.Image,
                    Size = p.Size,
                    Color = p.Color
                })
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} products", products.Count);
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Retrieves a specific product by ID
    /// </summary>
    /// <param name="id">The ID of the product</param>
    /// <returns>The product details</returns>
    /// <response code="200">Returns the product</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="404">If the product is not found</response>
    [HttpGet("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(ProductDto), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 404)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<ProductDto>> GetProduct(Guid id)
    {
        try
        {
            _logger.LogInformation("Request to get product {ProductId}", id);

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
                    Image = p.Image,
                    Size = p.Size,
                    Color = p.Color
                })
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                _logger.LogWarning("Product {ProductId} not found", id);
                return NotFound("Product not found");
            }

            _logger.LogInformation("Successfully retrieved product {ProductId}", id);
            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving product {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Retrieves a list of the most popular products based on likes
    /// </summary>
    /// <param name="limit">The maximum number of products to return (default: 10)</param>
    /// <returns>A list of the most-liked products</returns>
    /// <response code="200">Returns the list of popular products</response>
    /// <response code="400">If the limit is less than 1</response>
    /// <response code="401">If the user is not authenticated</response>
    [HttpGet("popular")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<ProductDto>), 200)]
    [ProducesResponseType(typeof(object), 400)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetPopularProduct([FromQuery] int limit = 10)
    {
        try
        {
            if (limit < 1)
            {
                _logger.LogWarning("Invalid limit parameter: {Limit}", limit);
                return BadRequest(new
                {
                    success = false,
                    message = "Invalid limit parameter",
                    errors = new[] { "Limit must be greater than 0" }
                });
            }

            _logger.LogInformation("Request to get {Limit} popular products", limit);
            
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
                    Image = p.Image,
                    Size = p.Size,
                    Color = p.Color
                })
                .ToListAsync();

            _logger.LogInformation("Successfully retrieved {Count} popular products", products.Count);
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving popular products");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Creates a new product (admin only)
    /// </summary>
    /// <param name="createDto">The product details to create</param>
    /// <param name="imageFile">Optional image file</param>
    /// <returns>The created product</returns>
    /// <response code="201">Returns the created product</response>
    /// <response code="400">If the input is invalid</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user is not an admin</response>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), 201)]
    [ProducesResponseType(typeof(object), 400)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 403)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromForm] CreateUpdateProductDto createDto, IFormFile? imageFile)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                
                _logger.LogWarning("Validation error when creating product: {Errors}", string.Join(", ", errors));
                
                return BadRequest(new
                {
                    success = false,
                    message = "Validation errors occurred",
                    errors = errors
                });
            }

            _logger.LogInformation("Admin attempting to create new product: {ProductName}", createDto.EnName);
            
            string finalImagePath;
            if (imageFile != null)
            {
                try
                {
                    finalImagePath = await _imageService.SaveImageAsync(imageFile, "products");
                    _logger.LogInformation("Image uploaded successfully: {ImagePath}", finalImagePath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Image upload failed for product creation");
                    return BadRequest(new
                    {
                        success = false,
                        message = "Image upload failed",
                        errors = new[] { ex.Message }
                    });
                }
            }
            else if (!string.IsNullOrEmpty(createDto.Image))
            {
                finalImagePath = createDto.Image;
            }
            else
            {
                _logger.LogWarning("No image provided for product creation");
                return BadRequest(new
                {
                    success = false,
                    message = "Image required",
                    errors = new[] { "Either imageFile or Image URL must be provided" }
                });
            }
            
            var product = new Product
            {
                UaName = createDto.UaName,
                EnName = createDto.EnName,
                Description = createDto.Description,
                Price = createDto.Price,
                Category = createDto.Category,
                Count = createDto.Count,
                Likes = createDto.Likes,
                Image = finalImagePath,
                Size = createDto.Size,
                Color = createDto.Color
            };

            try
            {
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Product {ProductId} created successfully", product.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database error when creating product");
                
                if (imageFile != null && !string.IsNullOrEmpty(finalImagePath))
                {
                    await _imageService.DeleteImageAsync(finalImagePath);
                }
                return StatusCode(500, "Internal server error");
            }
            
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
                Image = product.Image,
                Size = product.Size,
                Color = product.Color
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error when creating product");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Updates an existing product (admin only)
    /// </summary>
    /// <param name="id">The ID of the product to update</param>
    /// <param name="updateDto">The updated product details</param>
    /// <param name="imageFile">Optional new image file</param>
    /// <returns>The updated product</returns>
    /// <response code="200">Returns the updated product</response>
    /// <response code="400">If the input is invalid</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user is not an admin</response>
    /// <response code="404">If the product is not found</response>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ProductDto), 200)]
    [ProducesResponseType(typeof(object), 400)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 403)]
    [ProducesResponseType(typeof(string), 404)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<ProductDto>> UpdateProduct(Guid id, [FromForm] CreateUpdateProductDto updateDto, IFormFile? imageFile)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                    .ToList();
                
                _logger.LogWarning("Validation error when updating product {ProductId}: {Errors}", id, string.Join(", ", errors));
                
                return BadRequest(new
                {
                    success = false,
                    message = "Validation errors occurred",
                    errors = errors
                });
            }

            _logger.LogInformation("Admin attempting to update product {ProductId}", id);

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product {ProductId} not found for update", id);
                return NotFound("Product not found");
            }

            string? oldImagePath = product.Image;
            
            if (imageFile != null)
            {
                try
                {
                    var newImagePath = await _imageService.SaveImageAsync(imageFile, "products");
                    _logger.LogInformation("New image uploaded for product {ProductId}: {ImagePath}", id, newImagePath);
                    
                    if (!string.IsNullOrEmpty(oldImagePath) && oldImagePath.StartsWith("/uploads/"))
                    {
                        await _imageService.DeleteImageAsync(oldImagePath);
                        _logger.LogInformation("Old image deleted for product {ProductId}: {ImagePath}", id, oldImagePath);
                    }
                    product.Image = newImagePath;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Image upload failed for product {ProductId} update", id);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Image upload failed",
                        errors = new[] { ex.Message }
                    });
                }
            }
            else if (!string.IsNullOrEmpty(updateDto.Image) && updateDto.Image != product.Image)
            {
                if (!string.IsNullOrEmpty(oldImagePath) && oldImagePath.StartsWith("/uploads/"))
                {
                    await _imageService.DeleteImageAsync(oldImagePath);
                    _logger.LogInformation("Old image deleted for product {ProductId}: {ImagePath}", id, oldImagePath);
                }
                product.Image = updateDto.Image;
            }
            
            product.UaName = updateDto.UaName;
            product.EnName = updateDto.EnName;
            product.Description = updateDto.Description;
            product.Price = updateDto.Price;
            product.Category = updateDto.Category;
            product.Count = updateDto.Count;
            product.Likes = updateDto.Likes;
            product.Size = updateDto.Size;
            product.Color = updateDto.Color;

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Product {ProductId} updated successfully", id);

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
                Image = product.Image,
                Size = product.Size,
                Color = product.Color
            };

            return Ok(productDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Deletes a product by ID (admin only)
    /// </summary>
    /// <param name="id">The ID of the product to delete</param>
    /// <returns>Confirmation of deletion</returns>
    /// <response code="200">Product deleted successfully</response>
    /// <response code="401">If the user is not authenticated</response>
    /// <response code="403">If the user is not an admin</response>
    /// <response code="404">If the product is not found</response>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(object), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 403)]
    [ProducesResponseType(typeof(string), 404)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        try
        {
            _logger.LogInformation("Admin attempting to delete product {ProductId}", id);

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product {ProductId} not found for deletion", id);
                return NotFound("Product not found");
            }
            
            if (!string.IsNullOrEmpty(product.Image))
            {
                await _imageService.DeleteImageAsync(product.Image);
                _logger.LogInformation("Image deleted for product {ProductId}: {ImagePath}", id, product.Image);
            }
            
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Product {ProductId} deleted successfully", id);
            return Ok(new { Message = "Product deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
