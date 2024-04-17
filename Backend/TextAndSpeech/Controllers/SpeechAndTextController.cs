using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using System.Net;

namespace TextAndSpeech.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpeechAndTextController : ControllerBase
    {
        private string speechKey = "d3a2da1743b5452f86af5de95aab4bad";
        private string speechRegion = "eastus";

        [HttpPost("SpeechToText")]
        public async Task<IActionResult> SpeechToText(IFormFile? file)
        {
            try
            {
                if (file == null)
                    return BadRequest("Arquivo vazio ou não recebido.");

                var config = SpeechConfig.FromSubscription(speechKey, speechRegion);

                using var stream = file.OpenReadStream();
                
                var reader = new BinaryReader(stream);

                using var audioConfigStream = AudioInputStream.CreatePushStream();
                using var audioConfig = AudioConfig.FromStreamInput(audioConfigStream);

                var recognizer = new SpeechRecognizer(config, "pt-BR", audioConfig);

                byte[] readBytes;
                do
                {
                    readBytes = reader.ReadBytes(1024);
                    audioConfigStream.Write(readBytes, readBytes.Length);
                } while (readBytes.Length > 0);

                var result = await recognizer.RecognizeOnceAsync();

                var text = result.Text;

                return Ok(text);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("TextToSpeech")]
        public async Task<IActionResult> TextToSpeech(string text)
        {
            try
            {
                var config = SpeechConfig.FromSubscription(speechKey, speechRegion);

                using (var speechSynthesizer = new SpeechSynthesizer(config))
                {
                    var speechSynthesisResult = await speechSynthesizer.SpeakTextAsync(text);

                    Stream audioStream = new MemoryStream(speechSynthesisResult.AudioData);

                    return File(audioStream, "audio/wav");
                }

            }
            catch (Exception ex)
            {

                return BadRequest(ex.Message);
            }
        }
    }
}
