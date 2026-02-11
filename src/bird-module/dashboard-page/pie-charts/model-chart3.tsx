import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import PieChartModel from './diversity-indices';
import Orientation from 'react-native-orientation-locker';
import PieChartModel3 from './diversity-indices3';

const theme = {
  colors: {
    primary: '#56FF64',
    text: 'red',
    placeholder: 'white',
    surface: 'rgba(217, 217, 217, 0.7)',
  },
};

//the chart which display after click

const ModelChart3 = ({ setShowModelChart }) => {
  const route = useRoute();
  // const { rowData } = route.params;
  const navigation = useNavigation();
  const [selectedArea, setSelectedArea] = useState('Select your GPS location');

  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showPointFilter, setShowPointFilter] = useState(false);
  const [showBirdCount, setShowBirdCount] = useState(false);
  console.log('Search Option Page');

  useEffect(() => {
    // Lock orientation to landscape on component mount
    Orientation.lockToLandscape();

    // Clean up and reset orientation to default when component is unmounted
    return () => {
      Orientation.lockToPortrait(); // Reset to portrait mode when you leave the screen
    };
  }, []);

  return (
    <ImageBackground
      source={require('./../../../assets/image/imageD1.jpg')}
      style={styles.backgroundImage}>
      <TouchableOpacity onPress={() => setShowModelChart(false)}>
        <IconButton
          icon="keyboard-backspace"
          iconColor="black"
          size={30}
          style={{ marginRight: 20 }}
        />
      </TouchableOpacity>
      <ScrollView style={styles.title_container}>
        <PieChartModel3 />
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: '55%',
    height: 142,
    marginLeft: 'auto',
    marginRight: 24,
    marginTop: '60%',
  },
  title_container: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    marginTop: '20%',
  },
  main_text: {
    fontSize: 40,
    fontFamily: 'Inter-Bold',
    color: 'black',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  sub_text: {
    fontSize: 18,
    fontFamily: 'Inter-regular',
    color: '#000000',
    textAlign: 'center',
  },
  sub_text_bold: {
    fontSize: 20,
    fontFamily: 'Inter-regular',
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 5,
  },
  text_container: {
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteBox: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 240,
    backgroundColor: 'rgba(217, 217, 217, 0.7)',
    marginLeft: 14,
    marginRight: 14,
    marginTop: 80,
    borderRadius: 15,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },

});

export default ModelChart3;
