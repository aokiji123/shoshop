using System.Text.RegularExpressions;

namespace backend.Services;

public class ImageService : IImageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ImageService> _logger;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public ImageService(IWebHostEnvironment environment, ILogger<ImageService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        var fileName = Path.GetFileNameWithoutExtension(originalFileName);
        
        fileName = Regex.Replace(fileName, @"[^a-zA-Z0-9_-]", "");
        
        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        
        return $"{fileName}_{timestamp}_{uniqueId}{extension}";
    }

    public async Task<string> SaveImageAsync(IFormFile imageFile, string folderName = "products")
    {
        if (imageFile == null || imageFile.Length == 0)
            throw new ArgumentException("Image file is required");
        
        if (imageFile.Length > MaxFileSize)
            throw new ArgumentException($"File size cannot exceed {MaxFileSize / (1024 * 1024)}MB");
        
        var extension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
            throw new ArgumentException($"Only {string.Join(", ", _allowedExtensions)} files are allowed");
        
        var fileName = GenerateUniqueFileName(imageFile.FileName);
        
        var uploadsPath = Path.Combine(_environment.WebRootPath, "uploads", folderName);
        Directory.CreateDirectory(uploadsPath);
        
        var filePath = Path.Combine(uploadsPath, fileName);

        try
        {
            using var stream = new FileStream(filePath, FileMode.Create);
            await imageFile.CopyToAsync(stream);

            _logger.LogInformation("Image saved successfully: {FileName}", fileName);
            
            return $"/uploads/{folderName}/{fileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving image: {FileName}", fileName);
            throw new Exception("Failed to save image", ex);
        }
    }

    public async Task<bool> DeleteImageAsync(string imagePath)
    {
        if (string.IsNullOrEmpty(imagePath))
            return false;

        try
        {
            var fullPath = Path.Combine(_environment.WebRootPath, imagePath.TrimStart('/'));

            if (File.Exists(fullPath))
            {
                await Task.Run(() => File.Delete(fullPath));
                _logger.LogInformation("Image deleted successfully: {ImagePath}", imagePath);
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image: {ImagePath}", imagePath);
            return false;
        }
    }
}
