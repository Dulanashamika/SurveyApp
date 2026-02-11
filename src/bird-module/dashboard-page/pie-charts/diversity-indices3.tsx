import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../../../config';

const PieChartModel3 = () => {
  const navigation = useNavigation();
  const [birdData, setBirdData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { width } = Dimensions.get('window');

  // useEffect(() => {
  //   const fetchBirdDataByHabitat = async () => {
  //     console.log('Fetching bird data grouped by habitat type from API...');
  //     try {
  //       const response = await axios.get(`${API_URL}/bird-habitat`);
  //       console.log('Raw API response:', response.data);

  //       const total = response.data.reduce((sum, item) => sum + item.count, 0);
  //       console.log('Total count of all birds by habitat type:', total);

  //       const formattedData = response.data.map((item, index) => ({
  //         name: `${item.habitatType} (${((item.count / total) * 100).toFixed(2)}%)`,
  //         population: item.count,
  //         color: `hsl(${(index * 40) % 360}, 70%, 50%)`,
  //         legendFontColor: '#7F7F7F',
  //         legendFontSize: 15,
  //       }));
  //       console.log('Formatted chart data:', formattedData);

  //       setBirdData(formattedData);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error('Error fetching bird data by habitat type:', error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchBirdDataByHabitat();
  // }, []);

  useEffect(() => {
    const fetchBirdDataByHabitat = async () => {
      console.log('Fetching bird data grouped by habitat type from API...');
      try {
        const response = await axios.get(`${API_URL}/bird-habitat`);
        console.log('Raw API response:', response.data);
  
        // Check if response data is empty
        if (response.data.length === 0) {
          // If no data is returned, show a single "Unknown" habitat with a count of 0
          const formattedData = [{
            name: 'Unknown Habitat (0%)',
            population: 0,
            color: 'gray',
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
          }];
          setBirdData(formattedData);
          setLoading(false);
          return;
        }
  
        const total = response.data.reduce((sum, item) => sum + item.count, 0);
        console.log('Total count of all birds by habitat type:', total);
  
        const formattedData = response.data.map((item, index) => ({
          name: `${item.habitatType} (${((item.count / total) * 100).toFixed(2)}%)`,
          population: item.count,
          color: `hsl(${(index * 40) % 360}, 70%, 50%)`,
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }));
  
        console.log('Formatted chart data:', formattedData);
  
        setBirdData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bird data by habitat type:', error);
        // In case of error, show default "Unknown Habitat (0%)"
        const formattedData = [{
          name: 'Unknown Habitat (0%)',
          population: 0,
          color: 'gray',
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        }];
        setBirdData(formattedData);
        setLoading(false);
      }
    };
  
    fetchBirdDataByHabitat();
  }, []);
  
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal={true}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
    >
      <ScrollView>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconButton
            icon="keyboard-backspace"
            iconColor="black"
            size={30}
            style={{ marginRight: 20 }}
          />
        </TouchableOpacity>
        <View>
          <Text style={styles.sub_text}>Bird Count by Habitat Type</Text>
          <View style={styles.chartWithLegendContainer}>
            <PieChart
              data={birdData}
              width={width - 0}
              height={420}
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 1 },
                propsForDots: {
                  r: '10',
                  strokeWidth: '10',
                  stroke: '#000000',
                },
              }}
              accessor={'population'}
              backgroundColor={'transparent'}
              paddingLeft={'15'}
              center={[70, 0]}
              absolute
              hasLegend={false}
            />
            <View style={styles.customLegend}>
              {birdData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendColor,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWithLegendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customLegend: {
    marginLeft: 20,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 20,
    color: '#000000',
    marginRight: 20,
  },
  sub_text: {
    fontSize: 25,
    fontFamily: 'Inter-regular',
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 0,
  },
});

export default PieChartModel3;
