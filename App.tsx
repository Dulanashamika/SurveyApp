import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Appearance, useColorScheme } from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
} from 'react-native-paper';
import { useEffect, useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as Keychain from 'react-native-keychain';
import { navigationRef } from './src/utils/navigationRef';

// Auth Components (shared across all modules)

import RegisterPage from './src/auth/register-page/register-page';
import VerifyEmail from './src/auth/register-page/veryfy-email';
import VerifyFingerPrint from './src/auth/register-page/verify-fingerprint';
import SetPin from './src/auth/register-page/pin-password';
import GetUserName from './src/auth/register-page/get-user-name';
import PrivacyPolicy from './src/auth/register-page/privacy-policy';
import GetAdminApprove from './src/auth/register-page/get-verification-admin';
import LoginPage from './src/auth/login-page/login-page';
import AddPin from './src/auth/login-page/addpin-page';
import ForgetPasswordPage from './src/auth/login-page/forgot-pasword';
import VerifyFPEmail from './src/auth/login-page/veryfy-fogotPW-email';
import ResetPassword from './src/auth/login-page/reset-password';
import SetNewPin from './src/auth/login-page/re-add-new-pin';

// New Auth Screens
import LoginWelcome from './src/auth/login-page/LoginWelcome';
import SigninForm from './src/auth/login-page/SigninForm';
import SignupRoleSelection from './src/auth/login-page/SignupRoleSelection';
import SignupForm from './src/auth/login-page/SignupForm';
import SignupSurveyType from './src/auth/register-page/SignupSurveyType';
import SignupResearchAreas from './src/auth/register-page/SignupResearchAreas';
import SignupPeriodicalCategories from './src/auth/register-page/SignupPeriodicalCategories';
import SignupPersonalDetails from './src/auth/register-page/SignupPersonalDetails';
import SignupSuccess from './src/auth/register-page/SignupSuccess';


// Module Selector
import ModuleSelector from './src/module-selector/ModuleSelector';

// BluTally Start Page
import BluTallyStartPage from './src/blu-tally/BluTallyStartPage';

// Bird Module Components
import BirdBottomNav from './src/bird-module/bottom-navpage/bottom-nav';
import BirdMainDashboardPage from './src/bird-module/dashboard-page/dash-board';
import BirdProfileMenu from './src/bird-module/dashboard-page/menu-page/profile-page';
import BirdProfileImageChange from './src/bird-module/dashboard-page/menu-page/change-profile-image';
import BirdSurveyComponent from './src/bird-module/survey-drafts/add-new-survey';
import BirdSurveyPointData from './src/bird-module/survey-drafts/survey-point-data';
import BirdTeamData from './src/bird-module/survey-drafts/team-members';
import BirdCommonData from './src/bird-module/survey-drafts/common-data';
import BirdDataRecord from './src/bird-module/survey-drafts/add-bird-data';
import BirdCollectionPage from './src/bird-module/collection-page/collection';
import BirdSearchOption from './src/bird-module/Search-page/search-option';
import BirdSearchPage from './src/bird-module/Search-page/search-page';
import BirdPureSearchPage from './src/bird-module/Search-page/search-by-date';
import BirdSearchCount from './src/bird-module/Search-page/search-count';
import BirdNew from './src/bird-module/survey-form-page/new';
import BirdSurveyFormPage from './src/bird-module/Edit-Survey/Edit-survey';
import BirdSelectEditMode from './src/bird-module/Edit-Survey/Edit-permition';
import BirdEditCount from './src/bird-module/Edit-Survey/Edit-count';
import BirdDraftSurvey from './src/bird-module/submitted-draft-survey/draft-page';
import BirdCountTable from './src/bird-module/count-table/count-table';
import BirdMyDataTable from './src/bird-module/data-table/display-table';
import BirdMyCitizenTable from './src/bird-module/data-table/data-table-display';
import BirdCitySearchPage from './src/bird-module/Search-page/search-citizen';
import BirdPieChartModel from './src/bird-module/dashboard-page/pie-charts/diversity-indices';
import BirdPieChartModel1 from './src/bird-module/dashboard-page/pie-charts/diversity-indices1';
import BirdPieChartModel2 from './src/bird-module/dashboard-page/pie-charts/diversity-indices2';
import BirdPieChartModel3 from './src/bird-module/dashboard-page/pie-charts/diversity-indices3';

// Citizen Module Components
import CitizenStartPage from './src/citizen-module/start-pages/start-page';
import CitizenDashboard from './src/citizen-module/Citizen/CitizenDashboard';
import LanguageSelection from './src/citizen-module/LanguageSelection/LanguageOption';
import PlantDataCollection from './src/citizen-module/Citizen/PlantDataCollection';
import AnimalDataCollection from './src/citizen-module/Citizen/AnimalDataCollections';
import NatureDataCollection from './src/citizen-module/Citizen/NatureDataCollection';
import HumanActivityDataCollection from './src/citizen-module/Citizen/HumanActivityDataCollection';
import WelcomeSinhala from './src/citizen-module/start-pages/WelcomeSinhala';
import WelcomeTamil from './src/citizen-module/start-pages/WelcomeTamil';
import WelcomeEnglish from './src/citizen-module/start-pages/WelcomeEnglish';
import OptionSelection from './src/citizen-module/start-pages/OptionSelection';
import CreditInterface from './src/citizen-module/Citizen/CreditInterface';
import CitizenDataTable from './src/citizen-module/Citizen/CitizenDataTable';

// Mangrove Module Components
import MangroveNew from './src/mangrove-module/survey-form-page/new';
import MangroveDataTableComponent from './src/mangrove-module/data-table/MyDataTable';

// Config
import { GOOGLE_WEB_CLIENT_ID } from './src/config';

// Database
import { initDatabase } from './src/assets/sql_lite/db_connection';
import { getDatabase as getUserDatabase } from './src/bird-module/database/db';

// Network utilities
import { runNetworkDiagnostics } from './src/utils/networkUtils';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  scopes: ['profile', 'email'],
});

// Custom Themes
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200EE',
    background: '#FFFFFF',
    text: '#000000',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    background: '#121212',
    text: '#FFFFFF',
  },
};

// Create the Stack Navigator
const Stack = createNativeStackNavigator();

const customAnimation = {
  animationEnabled: true,
  gestureEnabled: true,
  cardStyleInterpolator: ({
    current,
  }: {
    current: { progress: { interpolate: Function } };
  }) => ({
    cardStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 0.5, 0.9, 1],
        outputRange: [0, 0.25, 0.7, 1],
      }),
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [1000, 0],
          }),
        },
      ],
    },
  }),
};

const App = () => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(
    systemTheme === 'dark' ? darkTheme : lightTheme,
  );
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Listen for theme changes
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });
    return () => listener.remove();
  }, []);

  // Initialize SQLite Database
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        console.log('BluTally database initialized successfully');

        // Initialize user_db database
        await getUserDatabase();
        console.log('User database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    setupDatabase();
  }, []);

  // Run network diagnostics
  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        const diagnostics = await runNetworkDiagnostics();
        console.log('[App] Network diagnostics:', diagnostics.summary);
      } catch (error) {
        console.error('[App] Error running diagnostics:', error);
      }
    };

    // Run diagnostics after a short delay to allow app to settle
    const timer = setTimeout(runDiagnostics, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Set the initial route
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          // If token exists, go to Welcome (ModuleSelector) or dashboard
          // But currently we don't have a simple dashboard, Welcome is ModuleSelector
          setInitialRoute('Welcome');
        } else {
          setInitialRoute('CitizenStartPage');
        }
      } catch (error) {
        setInitialRoute('CitizenStartPage');
      }
    };
    checkLogin();
  }, []);

  // Return null or a loader until the initial route is determined
  if (!initialRoute) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            ...customAnimation,
          }}>
          {/* ============== SHARED AUTH SCREENS ============== */}

          <Stack.Screen name="LoginWelcome" component={LoginWelcome} />
          <Stack.Screen name="SigninForm" component={SigninForm} />
          <Stack.Screen name="SignupRoleSelection" component={SignupRoleSelection} />
          <Stack.Screen name="SignupForm" component={SignupForm} />
          <Stack.Screen name="SignupSurveyType" component={SignupSurveyType} />
          <Stack.Screen name="SignupResearchAreas" component={SignupResearchAreas} />
          <Stack.Screen name="SignupPeriodicalCategories" component={SignupPeriodicalCategories} />
          <Stack.Screen name="SignupPersonalDetails" component={SignupPersonalDetails} />
          <Stack.Screen name="SignupSuccess" component={SignupSuccess} />
          <Stack.Screen name="RegisterPage" component={RegisterPage} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
          <Stack.Screen name="VerifyFingerPrint" component={VerifyFingerPrint} />
          <Stack.Screen name="SetPin" component={SetPin} />
          <Stack.Screen name="GetUserName" component={GetUserName} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen name="GetAdminApprove" component={GetAdminApprove} />
          <Stack.Screen name="LoginPage" component={LoginPage} />
          <Stack.Screen name="AddPin" component={AddPin} />
          <Stack.Screen name="ForgetPasswordPage" component={ForgetPasswordPage} />
          <Stack.Screen name="VerifyFPEmail" component={VerifyFPEmail} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
          <Stack.Screen name="SetNewPin" component={SetNewPin} />

          {/* ============== BLU TALLY START PAGE ============== */}
          <Stack.Screen name="BluTallyStartPage" component={BluTallyStartPage} />

          {/* ============== MODULE SELECTOR ============== */}
          <Stack.Screen name="Welcome" component={ModuleSelector} />
          <Stack.Screen name="ModuleSelector" component={ModuleSelector} />

          {/* ============== BIRD MODULE SCREENS ============== */}
          <Stack.Screen name="BirdBottomNav" component={BirdBottomNav} />
          <Stack.Screen name="BirdMainDashboardPage" component={BirdMainDashboardPage} />
          <Stack.Screen name="ProfileMenu" component={BirdProfileMenu} />
          <Stack.Screen name="ProfileImageChange" component={BirdProfileImageChange} />
          <Stack.Screen name="SurveyComponent" component={BirdSurveyComponent} />
          <Stack.Screen name="SurveyPointData" component={BirdSurveyPointData} />
          <Stack.Screen name="TeamData" component={BirdTeamData} />
          <Stack.Screen name="CommonData" component={BirdCommonData} />
          <Stack.Screen name="BirdDataRecord" component={BirdDataRecord} />
          <Stack.Screen name="CollectionPage" component={BirdCollectionPage} />
          <Stack.Screen name="SearchOption" component={BirdSearchOption} />
          <Stack.Screen name="SearchPage" component={BirdSearchPage} />
          <Stack.Screen name="PureSearchPage" component={BirdPureSearchPage} />
          <Stack.Screen name="SearchCount" component={BirdSearchCount} />
          <Stack.Screen name="New" component={BirdNew} />
          <Stack.Screen name="SurveyFormPage" component={BirdSurveyFormPage} />
          <Stack.Screen name="SelectEditMode" component={BirdSelectEditMode} />
          <Stack.Screen name="EditCount" component={BirdEditCount} />
          <Stack.Screen name="DraftSurvey" component={BirdDraftSurvey} />
          <Stack.Screen name="CountTable" component={BirdCountTable} />
          <Stack.Screen name="MyDataTable" component={BirdMyDataTable} />
          <Stack.Screen name="MyCitizenTable" component={BirdMyCitizenTable} />
          <Stack.Screen name="CitySearchPage" component={BirdCitySearchPage} />
          <Stack.Screen name="PieChartModel" component={BirdPieChartModel} />
          <Stack.Screen name="PieChartModel1" component={BirdPieChartModel1} />
          <Stack.Screen name="PieChartModel2" component={BirdPieChartModel2} />
          <Stack.Screen name="PieChartModel3" component={BirdPieChartModel3} />

          {/* ============== CITIZEN MODULE SCREENS ============== */}
          <Stack.Screen name="CitizenStartPage" component={CitizenStartPage} />
          <Stack.Screen name="CitizenLanguageSelection" component={LanguageSelection} />
          <Stack.Screen name="WelcomeSinhala" component={WelcomeSinhala} />
          <Stack.Screen name="WelcomeTamil" component={WelcomeTamil} />
          <Stack.Screen name="WelcomeEnglish" component={WelcomeEnglish} />
          <Stack.Screen name="OptionSelection" component={OptionSelection} />
          <Stack.Screen name="CitizenDashboard" component={CitizenDashboard} />
          <Stack.Screen name="PlantDataCollection" component={PlantDataCollection} />
          <Stack.Screen name="AnimalDataCollection" component={AnimalDataCollection} />
          <Stack.Screen name="NatureDataCollection" component={NatureDataCollection} />
          <Stack.Screen name="HumanActivityDataCollection" component={HumanActivityDataCollection} />
          <Stack.Screen name="CreditInterface" component={CreditInterface} />
          <Stack.Screen name="CitizenDataTable" component={CitizenDataTable} />

          {/* ============== MANGROVE MODULE SCREENS ============== */}
          <Stack.Screen name="MangroveNew" component={MangroveNew} />
          <Stack.Screen name="MangroveDataTable" component={MangroveDataTableComponent} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
