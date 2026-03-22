import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useAppStore } from '../src/store/useAppStore';
import { COLORS } from '../src/utils/helpers';
import { SOUND_CATALOG, SoundItem } from '../src/data/soundCatalog';

export default function SoundsScreen() {
  const { settings } = useAppStore();
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Set initial volume from settings
    if (settings) {
      setVolume(settings.sound_masking_volume);
    }
  }, [settings]);

  useEffect(() => {
    // Configure audio mode for background playback
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    return () => {
      // Cleanup on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const playSound = async (sound: SoundItem) => {
    try {
      // Stop current sound if playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (!sound.source) {
        Alert.alert(
          'Sonido no disponible',
          `"${sound.title}" aún no tiene archivo de audio. Agrega el archivo .mp3 en assets/sounds/.`
        );
        return;
      }

      const { sound: audioSound } = await Audio.Sound.createAsync(
        sound.source,
        {
          isLooping: true,
          volume: volume / 100,
        }
      );

      soundRef.current = audioSound;
      await audioSound.playAsync();
      setActiveSound(sound.id);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Error', 'No se pudo reproducir el sonido.');
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setActiveSound(null);
    setIsPlaying(false);
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const changeVolume = async (newVolume: number) => {
    setVolume(newVolume);
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(newVolume / 100);
    }
  };

  const activeSoundData = SOUND_CATALOG.find(s => s.id === activeSound);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Sonidos de Enmascaramiento</Text>
          <Text style={styles.subtitle}>
            Sonidos de fondo que ayudan a tu cerebro a dejar de enfocar el tinnitus
          </Text>
        </View>

        {/* Now Playing */}
        {activeSound && activeSoundData && (
          <View style={[styles.nowPlaying, { borderLeftColor: activeSoundData.color }]}>
            <View style={styles.nowPlayingInfo}>
              <Ionicons name={activeSoundData.icon} size={24} color={activeSoundData.color} />
              <View>
                <Text style={styles.nowPlayingTitle}>{activeSoundData.title}</Text>
                <Text style={styles.nowPlayingStatus}>
                  {isPlaying ? 'Reproduciendo' : 'En pausa'}
                </Text>
              </View>
            </View>
            <View style={styles.nowPlayingControls}>
              <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={stopSound} style={styles.controlButton}>
                <Ionicons name="stop" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Volume */}
        <View style={styles.volumeSection}>
          <Text style={styles.volumeLabel}>Volumen: {volume}%</Text>
          <View style={styles.volumeRow}>
            <Ionicons name="volume-low-outline" size={18} color={COLORS.textSecondary} />
            <View style={styles.volumeTrack}>
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[
                    styles.volumeDot,
                    volume >= v && styles.volumeDotActive,
                  ]}
                  onPress={() => changeVolume(v)}
                />
              ))}
            </View>
            <Ionicons name="volume-high-outline" size={18} color={COLORS.textSecondary} />
          </View>
        </View>

        {/* Sound Grid */}
        <View style={styles.soundGrid}>
          {SOUND_CATALOG.map((sound) => {
            const isActive = activeSound === sound.id;
            const isAvailable = sound.source !== null;
            return (
              <TouchableOpacity
                key={sound.id}
                style={[
                  styles.soundCard,
                  isActive && { borderColor: sound.color, borderWidth: 2 },
                  !isAvailable && styles.soundCardUnavailable,
                ]}
                onPress={() => isActive ? stopSound() : playSound(sound)}
              >
                <View style={[styles.soundIcon, { backgroundColor: sound.color + '15' }]}>
                  <Ionicons
                    name={sound.icon}
                    size={28}
                    color={isAvailable ? sound.color : COLORS.textLight}
                  />
                  {isActive && isPlaying && (
                    <View style={[styles.playingIndicator, { backgroundColor: sound.color }]} />
                  )}
                </View>
                <Text style={[
                  styles.soundTitle,
                  !isAvailable && styles.soundTitleUnavailable,
                ]}>
                  {sound.title}
                </Text>
                <Text style={styles.soundDescription}>{sound.description}</Text>
                {!isAvailable && (
                  <Text style={styles.unavailableText}>Próximamente</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            El enmascaramiento no busca tapar el tinnitus, sino darle a tu cerebro un sonido alternativo en el que enfocarse. Usa un volumen ligeramente por debajo del nivel de tu tinnitus.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  nowPlaying: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  nowPlayingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nowPlayingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  nowPlayingStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  nowPlayingControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  volumeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeTrack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
  },
  volumeDotActive: {
    backgroundColor: COLORS.primary,
  },
  soundGrid: {
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  soundCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  soundCardUnavailable: {
    opacity: 0.6,
  },
  soundIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  playingIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  soundTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  soundTitleUnavailable: {
    color: COLORS.textLight,
  },
  soundDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  unavailableText: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 6,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});
