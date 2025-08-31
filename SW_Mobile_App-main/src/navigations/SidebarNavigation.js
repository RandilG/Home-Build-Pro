// import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native'
// import React, { useState, useRef } from 'react'
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

// const SidebarNavigation = ({ navigation }) => {
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const slideAnim = useRef(new Animated.Value(-300)).current
  
//   const toggleSidebar = () => {
//     const toValue = sidebarOpen ? -300 : 0
//     Animated.timing(slideAnim, {
//       toValue,
//       duration: 300,
//       useNativeDriver: true,
//     }).start()
//     setSidebarOpen(!sidebarOpen)
//   }

//   const navigateTo = (screen) => {
//     toggleSidebar()
//     navigation.navigate(screen)
//   }

//   const menuItems = [
//     { icon: 'home', label: 'Dashboard', screen: 'Dashboard' },
//     { icon: 'view-grid', label: 'Projects', screen: 'ViewProjects' },
//     { icon: 'flag-checkered', label: 'Milestones', screen: 'UpcommingStages' },
//     { icon: 'plus-circle', label: 'Add Project', screen: 'AddProject' },
//     { icon: 'magnify', label: 'Search', screen: 'Search' },
//     { icon: 'account', label: 'Profile', screen: 'ProfileScreen' },
//     { icon: 'cog', label: 'Settings', screen: 'Settings' },
//     { icon: 'help-circle', label: 'Help', screen: 'Help' },
//     // Add more menu items as needed
//   ]

//   return (
//     <>
//       {/* Hamburger Menu Button */}
//       <TouchableOpacity 
//         style={styles.menuButton} 
//         onPress={toggleSidebar}
//       >
//         <Icon name="menu" size={30} color="#FFFFFF" />
//       </TouchableOpacity>

//       {/* Overlay when sidebar is open */}
//       {sidebarOpen && (
//         <TouchableOpacity 
//           style={styles.overlay}
//           activeOpacity={1}
//           onPress={toggleSidebar}
//         />
//       )}

//       {/* Sidebar */}
//       <Animated.View 
//         style={[
//           styles.sidebar,
//           { transform: [{ translateX: slideAnim }] }
//         ]}
//       >
//         <View style={styles.sidebarHeader}>
//           <Text style={styles.sidebarTitle}>Dream Home</Text>
//           <TouchableOpacity onPress={toggleSidebar}>
//             <Icon name="close" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         <ScrollView style={styles.menuContainer}>
//           {menuItems.map((item, index) => (
//             <TouchableOpacity 
//               key={index}
//               style={styles.menuItem}
//               onPress={() => navigateTo(item.screen)}
//             >
//               <Icon name={item.icon} size={24} color="#FFFFFF" />
//               <Text style={styles.menuText}>{item.label}</Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
        
//         {/* Reserved space for future fields */}
//         <View style={styles.reservedSpace}>
//           <Text style={styles.reservedText}>Reserved for future content</Text>
//         </View>
//       </Animated.View>
//     </>
//   )
// }

// const styles = StyleSheet.create({
//   menuButton: {
//     position: 'absolute',
//     top: 55,
//     left: 20,
//     zIndex: 999,
//   },
//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     zIndex: 998,
//   },
//   sidebar: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: 300,
//     height: '100%',
//     backgroundColor: '#0D6E3E',
//     zIndex: 999,
//     paddingTop: 50,
//     paddingHorizontal: 15,
//   },
//   sidebarHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 30,
//     paddingHorizontal: 10,
//   },
//   sidebarTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   menuContainer: {
//     flex: 1,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.2)',
//   },
//   menuText: {
//     fontSize: 18,
//     color: '#FFFFFF',
//     marginLeft: 15,
//   },
//   reservedSpace: {
//     padding: 20,
//     marginTop: 20,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   reservedText: {
//     color: '#FFFFFF',
//     opacity: 0.7,
//     textAlign: 'center',
//   }
// })

// export default SidebarNavigation