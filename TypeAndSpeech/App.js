import { BoxFunction, BoxFunction2, BoxFunction3, BoxFunction4, BoxFunction5, BoxFunctionAlign, BoxPai, BoxTitle, InputBox, InputText, InputView, TextTitle } from './Style';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';

import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from './Services';
import { Audio } from 'expo-av';




export default function App() {
  const [audio, setAudio] = useState([]);
  const [text, setText] = useState("Teste");
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [uri, setUri] = useState();
  const [recording, setRecording] = useState();
  const [sound, setSound] = useState();
  const [open, setOpen] = useState(false);

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
     
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        extension: ".wav",
        allowsRecordingIOS: false,
      }
    );
    setUri(recording.getURI());
    setOpen(false);
    console.log('Recording stopped and stored at', uri);
  }

  async function playSound() {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync({ uri });
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

  async function TextToSpeech() {

    const resApi = (await api.post(`/SpeechAndText/TextToSpeech?text=${text}`))
      .then(response => {
        console.log(response.data);
      })
  }

  async function SpeechToText(uri) {
    const form = new FormData();
    form.append("Arquivo", {
      uri: uri,
      name: "audio.wav",
      type: "audio/wav"
    });

    form.append("", text)

    const resApi = (await api.post(`/SpeechAndText/SpeechtoText`, form, { headers: { 'Content-Type': 'multfpart/data' } }))
      .then(response => {
        console.log(response.data);
      })
  }

  useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);




  return (
    <BoxPai>
      <BoxTitle>
        <FontAwesome5 name="rocketchat" size={24} color="#DB30A2" />
        <TextTitle>Type and Speech</TextTitle>
      </BoxTitle>
      <InputView>
        <InputBox

        >
          <InputText
            value={text}
            onChangeText={() => { setText(text) }}
            placeholder={"useless placeholder"}
          />


        </InputBox>

        <BoxFunctionAlign>
          <BoxFunction>
            <FontAwesome name="trash" size={24} color="white" />
          </BoxFunction>

          <BoxFunction2>
            <Ionicons name="copy" size={24} color="white" />
          </BoxFunction2>

          <BoxFunction3 onPress={() => { TextToSpeech() }}>
            <Entypo name="controller-play" size={24} color="white" />
          </BoxFunction3>
        </BoxFunctionAlign>

      </InputView>

      {/* Ternario para stop de recording */}

      { open?

        <BoxFunction5 onPress={() => { stopRecording(), SpeechToText(uri) }}>
          <Entypo name="controller-stop" size={24} color="white" />
        </BoxFunction5>
        :
        <BoxFunction4 onPress={() => {startRecording(), setOpen(true)}}>
          <FontAwesome5 name="microphone" size={30} color="white" />
        </BoxFunction4>
      }
    </BoxPai>
  );
}


