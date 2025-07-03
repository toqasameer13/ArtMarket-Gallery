import { Switch, Route } from "wouter";
import { AuthProvider } from "../context/authContext";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Login from "./login";
import Register from "./register";
import Welcome from "./welcome";
import Admin from "./admin";
import BrowseArtworks from "./BrowseArtworks";
import ArtworkDetails from "./ArtworkDetails";
import NotFound from "./not-found";
import ArtworkPreview from "./ArtworkPreview";
import BiddingHistory from "./BidHistoryPage";
import PaymentPage from "./PaymentPage";
import EditArtwork from "./EditArtwork";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BrowseArtworks} />
      <Route path="/browse" component={BrowseArtworks} />
      <Route path="/artworks" component={BrowseArtworks} />
      <Route path="/artworks/:id" component={ArtworkDetails} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/welcome" component={Welcome} />
      <Route path="/admin" component={Admin} />
      <Route path="/artwork-preview" component={ArtworkPreview} />
      <Route path="/payment/:id" component={PaymentPage} />
      <Route path="/artwork/:id/history" component={BiddingHistory} />
      <Route path="/edit-artwork/:artworkId" component={EditArtwork} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Router />
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
