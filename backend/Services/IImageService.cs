namespace backend.Services;

public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile imageFile, string folderName = "products");
    Task<bool> DeleteImageAsync(string imagePath);
    string GenerateUniqueFileName(string originalFileName);
}
