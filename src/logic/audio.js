// src/logic/audio.js
import { Audio } from 'expo-av';

export async function playCalculateSound() {
  try {
    // This loads and plays the sound in one go
    const { sound } = await Audio.Sound.createAsync(
      // Ensure you have a sound file at this path in your assets folder
      require('../../assets/calculate-ping.mp3'), 
      { shouldPlay: true, volume: 0.5 }
    );

    // Unload the sound from memory once it finishes to keep the app fast
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.log("Could not play sound", error);
  }
}