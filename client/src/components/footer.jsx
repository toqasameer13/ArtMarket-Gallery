export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <i className="ri-palette-line"></i>
            ArtMarket
          </div>

        </div>
        
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} ArtMarket. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
