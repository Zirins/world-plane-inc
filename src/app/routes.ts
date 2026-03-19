import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { SearchResults } from "./components/SearchResults";
import { SeatSelection } from "./components/SeatSelection";
import { Booking } from "./components/Booking";
import { Confirmation } from "./components/Confirmation";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "results", Component: SearchResults },
      { path: "seat-selection", Component: SeatSelection },
      { path: "booking", Component: Booking },
      { path: "confirmation", Component: Confirmation },
    ],
  },
]);