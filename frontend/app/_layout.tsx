import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../src/utils/helpers';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="chapter/[id]"
          options={{
            title: 'Capítulo',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="program/index"
          options={{
            title: 'Programa',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Configuración',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="factors"
          options={{
            title: 'Factores',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="mindfulness"
          options={{
            title: 'Mindfulness',
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}
