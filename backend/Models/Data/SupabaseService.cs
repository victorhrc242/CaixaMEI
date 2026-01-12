using Microsoft.Extensions.Options;
using Models.Data;
using Supabase;

public class SupabaseService
{
    public Client Client { get; }

    public SupabaseService(IOptions<SupabaseSettings> options)
    {
        var settings = options.Value;

        Client = new Client(
            settings.Url,
            settings.ServiceRoleKey,
            new SupabaseOptions
            {
                AutoRefreshToken = false,
                AutoConnectRealtime = false
            }
        );

        // 🔥 ESSENCIAL
        Client.InitializeAsync().GetAwaiter().GetResult();
    }
}
