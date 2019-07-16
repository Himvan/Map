/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Text, View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import GeoFencing from 'react-native-geo-fencing';







export default class App extends Component {



  state = {
     polygon : [
      { lat: 3.1336599385978805, lng: 101.31866455078125 },
      { lat: 3.3091633559540123, lng: 101.66198730468757 },
      { lat: 3.091150714460597,  lng: 101.92977905273438 },
      { lat: 2.7222113428196213, lng: 101.74850463867188 },
      { lat: 2.7153526167685347, lng: 101.47933959960938 },
      { lat: 3.1336599385978805, lng: 101.31866455078125 } // last point has to be same as first point
    ],
  
    mapRegion: null,
    lastLat: null,
    lastLong: null,
    unit: '',
    temperature: '',
    city: '',
    coordinate: ([{
      latitude: 28.23,
      longitude: 77.023,
      title: 'hii'
    }])



  }



  weather_data = async (lat, lng) => {
    await fetch('http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=1sUMBaFBKquMKrd7KPrXd0wmuG509voV&q=' + lat + ',' + lng, {
      method: 'GET',
      headers: {
        'content-Type': 'application/json',
      }
    }).then(response => response.json()).
      then(res => {
        fetch("http://dataservice.accuweather.com/currentconditions/v1/" + res.Key + "?apikey=1sUMBaFBKquMKrd7KPrXd0wmuG509voV")
          .then(response => response.json()).
          then(res => {
            this.setState({
              temperature: res[0].Temperature.Metric.Value,
              unit: res[0].Temperature.Metric.Unit
            })
            console.log(this.state.temperature + ' ' + this.state.unit)
          })



      })
  }


  onRegionChange = (region, lastLat, lastLong) => {

    this.state.coordinate.push({ latitude: lastLat, longitude: lastLong })
    this.setState({
      mapRegion: region,
      coordinate: this.state.coordinate,
      lastLat: lastLat || this.state.lastLat,
      lastLong: lastLong || this.state.lastLong
    });
  }

  currentLocation = async () => {
    await navigator.geolocation.getCurrentPosition(
      (position) => {

        let point={
          lat:position.coords.latitude,
          lng:position.coords.longitude
        }
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.00922,
          longitudeDelta: 0.00421
        }
       
        GeoFencing.containsLocation(point, this.state.polygon)
        .then(() => console.warn('point is within polygon'))
        .catch(() => console.warn('point is NOT within polygon'))


        this.onRegionChange(region, region.latitude, region.longitude);
        this.weather_data(region.latitude, region.longitude)
      })
  }

  fetch_city = async () => {
    await fetch('http://dataservice.accuweather.com/locations/v1/cities/search?apikey=1sUMBaFBKquMKrd7KPrXd0wmuG509voV&q=' + this.state.city, {
      method: 'GET',
      headers: {
        'content-Type': 'application/json',
      },

    }).then(response => response.json()).
      then(res => {
        let region = {
          latitude: res[0].GeoPosition.Latitude,
          longitude: res[0].GeoPosition.Longitude,
          latitudeDelta: 0.00922,
          longitudeDelta: 0.00421
        }
        this.onRegionChange(region, region.latitude, region.longitude)
        this.weather_data(region.latitude, region.longitude)
      })

  }



  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 0.5 }}>
            <TextInput placeholder="Enter City Name" onChangeText={(val) => {
              this.setState({
                city: val
              })
            }}
              onSubmitEditing={() => {
                this.fetch_city()
              }}
            />
          </View>
          <View style={{ flex: 0.5, paddingTop: 15 }}>
            <TouchableOpacity onPress={() => this.currentLocation()}>
              <Text>  Get Current Location </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 3 }}>
          <MapView
            style={styles.map}
            region={this.state.mapRegion}
            showsUserLocation={true}
            ref={ref => (this.map = ref)}
            followUserLocation={true}
            onRegionChange={this.onRegionChange.bind(this)}>
            {this.state.coordinate.map(markers => {
              <MapView.Marker
                coordinate={markers}>

              </MapView.Marker>
            })}
          </MapView>


        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
          <Text style={{ height: 70, width: 70 }}>
            {this.state.temperature}  degree
      </Text>

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  }
});