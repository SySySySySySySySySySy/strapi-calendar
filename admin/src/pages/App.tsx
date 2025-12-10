import { Page, useAuth } from '@strapi/strapi/admin';
import { useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SettingsProvider } from '../context/Settings';
import pluginPermissions from '../utils/permissions';
import CalendarPage from './CalendarPage';

const App = () => {
  const readPermissions = useAuth('CalendarPage', (state) => state.permissions);
  const hasSettingsPermissions = useMemo(() => {
    return !!readPermissions.find(({ action }) => action === pluginPermissions.calendar[0].action);
  }, [readPermissions]);

  if (!hasSettingsPermissions) {
    return <Page.NoPermissions />;
  }

  return (
    <SettingsProvider>
      <Routes>
        <Route index element={<CalendarPage />} />
        <Route path="*" element={<Page.Error />} />
      </Routes>
    </SettingsProvider>
  );
};

export default App;
