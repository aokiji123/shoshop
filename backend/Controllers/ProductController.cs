using AutoMapper;
using backend.Data;
using backend.DTOs.Products;
using backend.Models;
using backend.Models.Enums;
using backend.QueryObjects;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/product")]
[ApiController]
public class ProductController : BaseController
{
    private readonly DataContext _context;
    private readonly IImageService _imageService;
    private readonly ILogger<ProductController> _logger;
    private readonly IMapper _mapper;

    public ProductController(DataContext context, IImageService imageService, ILogger<ProductController> logger, IMapper mapper)
    {
        _context = context;
        _imageService = imageService;
        _logger = logger;
        _mapper = mapper;
    }

    /// <summary>
    /// Retrieves a list of all products
    /// </summary>
    /// <returns>A list of products</returns>
    /// <response code="200">Returns the list of products</response>
    /// <response code="401">If the user is not authenticated</response>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(PagedResult<ProductDto>), 200)]
    [ProducesResponseType(typeof(string), 401)]
    [ProducesResponseType(typeof(string), 500)]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(
        [FromQuery] ProductFilter productFilter, 
        [FromQuery] SortParams sortParams,
        [FromQuery] PageParams pageParams)
    {
        try
        {
            _logger.LogInformation("Request to get all products");

            var pagedProducts = await _context.Products
                .Filter(productFilter)
                .Sort(sortParams)
                .ToPagedAsync(pageParams);

            var productDtos = _mapper.Map<ProductDto[]>(pagedProducts.Data);
            var result = new PagedResult<ProductDto>(productDtos, pagedProducts.TotalCount);

            _logger.LogInformation("Successfully retrieved {Count} products out of {TotalCount} total", 
                productDtos.Length, pagedProducts.TotalCount);
        
            return Ok(result);
        }
        catch (Exception ex)
        {
            return HandleException<PagedResult<ProductDto>>(ex, _logger, "GetProducts");
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

            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                _logger.LogWarning("Product {ProductId} not found", id);
                return NotFound("Product not found");
            }
            
            var productDto = _mapper.Map<ProductDto>(product);

            _logger.LogInformation("Successfully retrieved product {ProductId}", id);
            return Ok(productDto);
        }
        catch (Exception ex)
        {
            return HandleException<ProductDto>(ex, _logger, "GetProduct");
        }
    }

    /// <summary>
    /// Get all available categories
    /// </summary>
    [HttpGet("categories")]
    public IActionResult GetCategories()
    {
        var categories = Enum.GetValues<ProductCategory>()
            .Select(c => new { 
                Value = (int)c, 
                Name = c.ToString()
            });
        return Ok(categories);
    }

    /// <summary>
    /// Get all available sizes
    /// </summary>
    [HttpGet("sizes")]
    public IActionResult GetSizes()
    {
        var sizes = Enum.GetValues<ProductSize>()
            .Select(s => new { 
                Value = (int)s, 
                Name = s.ToString()
            });
        return Ok(sizes);
    }

    /// <summary>
    /// Get all available colors
    /// </summary>
    [HttpGet("colors")]
    public IActionResult GetColors()
    {
        var colors = Enum.GetValues<ProductColor>()
            .Select(c => new { 
                Value = (int)c, 
                Name = c.ToString()
            });
        return Ok(colors);
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
            
            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.EnName.ToLower() == createDto.EnName.ToLower() || 
                                         p.UaName.ToLower() == createDto.UaName.ToLower());
            
            if (existingProduct != null)
            {
                _logger.LogWarning("Product with name {ProductName} already exists", createDto.EnName);
                return BadRequest(new
                {
                    success = false,
                    message = "Product already exists",
                    errors = new[] { "Product with this name already exists" }
                });
            }
            
            string finalImagePath;
            
            if (imageFile != null)
            {
                try
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                    var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "Invalid file type",
                            errors = new[] { "Only image files (jpg, jpeg, png, gif, webp) are allowed" }
                        });
                    }
                    
                    if (imageFile.Length > 5 * 1024 * 1024)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "File too large",
                            errors = new[] { "Image file size must be less than 5MB" }
                        });
                    }

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
                if (Uri.TryCreate(createDto.Image, UriKind.Absolute, out var uri) && 
                    (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
                {
                    finalImagePath = createDto.Image;
                }
                else
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid image URL",
                        errors = new[] { "Please provide a valid image URL" }
                    });
                }
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
            
            var product = _mapper.Map<Product>(createDto);
            product.Image = finalImagePath;

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            
            var productDto = _mapper.Map<ProductDto>(product);

            _logger.LogInformation("Product {ProductId} ({ProductName}) created successfully by admin", 
                product.Id, product.EnName);

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, productDto);
        }
        catch (Exception ex)
        {
            return HandleException<ProductDto>(ex, _logger, "CreateProduct");
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

            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.Id != id && 
                                         (p.EnName.ToLower() == updateDto.EnName.ToLower() || 
                                          p.UaName.ToLower() == updateDto.UaName.ToLower()));
            
            if (existingProduct != null)
            {
                _logger.LogWarning("Product with name {ProductName} already exists", updateDto.EnName);
                return BadRequest(new
                {
                    success = false,
                    message = "Product already exists",
                    errors = new[] { "Product with this name already exists" }
                });
            }

            string? oldImagePath = product.Image;
            
            if (imageFile != null)
            {
                try
                {
                    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                    var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                    
                    if (!allowedExtensions.Contains(fileExtension))
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "Invalid file type",
                            errors = new[] { "Only image files (jpg, jpeg, png, gif, webp) are allowed" }
                        });
                    }

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
                if (!updateDto.Image.StartsWith("/uploads/") && 
                    !Uri.TryCreate(updateDto.Image, UriKind.Absolute, out var uri))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Invalid image URL",
                        errors = new[] { "Please provide a valid image URL" }
                    });
                }
                
                if (!string.IsNullOrEmpty(oldImagePath) && oldImagePath.StartsWith("/uploads/"))
                {
                    await _imageService.DeleteImageAsync(oldImagePath);
                    _logger.LogInformation("Old image deleted for product {ProductId}: {ImagePath}", id, oldImagePath);
                }
                
                product.Image = updateDto.Image;
            }
            
            _mapper.Map(updateDto, product);

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Product {ProductId} updated successfully", id);
            
            var productDto = _mapper.Map<ProductDto>(product);

            return Ok(productDto);
        }
        catch (Exception ex)
        {
            return HandleException<ProductDto>(ex, _logger, "UpdateProduct");
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
    public async Task<ActionResult<object>> DeleteProduct(Guid id)
    {
        try
        {
            _logger.LogInformation("Admin attempting to delete product {ProductId}", id);

            var product = await _context.Products
                .Include(p => p.OrderProducts)
                .FirstOrDefaultAsync(p => p.Id == id);
                
            if (product == null)
            {
                _logger.LogWarning("Product {ProductId} not found for deletion", id);
                return NotFound("Product not found");
            }
            
            if (product.OrderProducts.Any())
            {
                _logger.LogWarning("Cannot delete product {ProductId} - it has associated orders", id);
                return Conflict(new
                {
                    success = false,
                    message = "Cannot delete product",
                    errors = new[] { "This product cannot be deleted because it is associated with existing orders" }
                });
            }
            
            if (!string.IsNullOrEmpty(product.Image) && product.Image.StartsWith("/uploads/"))
            {
                try
                {
                    await _imageService.DeleteImageAsync(product.Image);
                    _logger.LogInformation("Image deleted for product {ProductId}: {ImagePath}", id, product.Image);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete image for product {ProductId}: {ImagePath}", id, product.Image);
                }
            }
            
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Product {ProductId} deleted successfully", id);
            
            return Ok(new 
            { 
                success = true,
                message = "Product deleted successfully",
                productId = id
            });
        }
        catch (Exception ex)
        {
            return HandleException<object>(ex, _logger, "DeleteProduct");
        }
    }
}