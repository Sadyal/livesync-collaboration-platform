import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { useLogout } from '../../features/auth/hooks';
import './Layout.css';

/**
 * @component Navbar
 * @description The top navigation bar. Features a modern floating pill design.
 * Handles theme toggling, user profile summary, and logout capabilities.
 * @param {Function} onMenuClick - Callback to open the mobile sidebar drawer.
 */
const Navbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { logout } = useLogout();

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open Menu">
          <Menu size={24} color="var(--text-primary)" />
        </button>
      </div>
      
      <div className="navbar-right">
        <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} color="var(--text-secondary)" /> : <Moon size={20} color="var(--text-secondary)" />}
        </button>
        
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <div className="user-profile">
            <div className="avatar">
              {getInitials(user?.name)}
            </div>
            <span className="user-name">{user?.name || 'User'}</span>
          </div>
        </Link>
        
        <button 
          onClick={logout} 
          className="logout-btn"
          title="Logout"
        >
          <LogOut size={20} />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
