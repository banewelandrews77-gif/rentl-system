using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        using (var client = new HttpClient()) {
            var content = new StringContent("{""email"":""student1@university.edu"",""password"":""password123""}", System.Text.Encoding.UTF8, "application/json");
            var response = await client.PostAsync("http://localhost:8080/api/auth/login", content);
            var body = await response.Content.ReadAsStringAsync();
            Console.WriteLine("Status: " + response.StatusCode);
            Console.WriteLine("Body: " + body);
        }
    }
}
