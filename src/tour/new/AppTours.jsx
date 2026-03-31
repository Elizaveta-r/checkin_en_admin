// AppTours.jsx
import { useGuidedTours } from "./useGuidedTours";
import { ToursRegistry, TOUR_ORDER } from "./toursRegistry";

export default function AppTours() {
  useGuidedTours(ToursRegistry, TOUR_ORDER);
  return null; // невидимый компонент
}
