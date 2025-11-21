import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  streamUrl: string;
  style?: any;
};

export function LiveStreamView({ streamUrl, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{
          html: `
            <html>
              <body style="margin:0;padding:0;background:black;display:flex;justify-content:center;align-items:center;height:100vh;">
                <img src="${streamUrl}" style="width:100%;height:100%;object-fit:contain;" />
              </body>
            </html>
          `,
        }}
        style={{ flex: 1, backgroundColor: 'black' }}
        scrollEnabled={false}
        pointerEvents="none"
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#487307" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});