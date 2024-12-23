using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace API.Services;

public class ImageService
{
    private readonly Cloudinary _cloudinary;

    public ImageService(IConfiguration config)
    {
        Account acc = new Account
        (
            config["Cloudinary:CloudName"],
            config["Cloudinary:ApiKey"],
            config["Cloudinary:ApiSecret"]
        );

        _cloudinary = new Cloudinary(acc);
    }

    public async Task<ImageUploadResult> AddImageAsync(IFormFile file)
    {
        ImageUploadResult uploadResult = new ImageUploadResult();

        if (file.Length > 0)
        {
            using Stream stream = file.OpenReadStream();
            ImageUploadParams uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream)
            };
            uploadResult = await _cloudinary.UploadAsync(uploadParams);
        }

        return uploadResult;
    }

    public async Task<DeletionResult> DeleteImageAsync(string publicId)
    {
        DeletionParams deleteParams = new DeletionParams(publicId);

        DeletionResult result = await _cloudinary.DestroyAsync(deleteParams);

        return result;
    }
}