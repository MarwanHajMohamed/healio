import React, { useEffect } from "react";
import Navbar from "./Navbar";
import "../css/pageintro.css";

import NewChat from "../css/assets/tutorial/New Chat.mp4";
import EnterSymptoms from "../css/assets/tutorial/Enter Symptoms.mp4";
import ViewPharmacy from "../css/assets/tutorial/View Pharmacies.mp4";
import ViewGP from "../css/assets/tutorial/View GPs.mp4";
import ViewSymptoms from "../css/assets/tutorial/View Symptoms.mp4";
import ViewTreatment from "../css/assets/tutorial/View Treatment.mp4";

// Carousel
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  DotGroup,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";

export default function PageIntro() {
  useEffect(() => {
    if (localStorage.length === 0 || localStorage.getItem("token") === "") {
      localStorage.setItem("token", "");
    }
  });

  return (
    <div className="pageintro-wrapper">
      <Navbar />
      <div className="pageintro-wrapper">
        <div className="pageintro-container">
          <div className="left-side">
            <div className="title">
              Welcome your new AI healthcare assistant, Healio!
            </div>
            <div className="description">
              Healio is an AI healthcare chatbot which was trained on extensive
              medical data, empowering it to predict potential diseases based on
              the symptoms you provide.
            </div>
          </div>
          <div className="right-side">
            <CarouselProvider
              naturalSlideWidth={100}
              naturalSlideHeight={124}
              totalSlides={6}
              className="carousel-container"
              infinite={true}
            >
              <Slider className="slider">
                <Slide index={0} className="slide">
                  <video autoPlay loop muted src={NewChat} className="item" />
                </Slide>
                <Slide index={1} className="slide">
                  <video
                    src={EnterSymptoms}
                    autoPlay
                    loop
                    muted
                    className="item"
                  />
                </Slide>
                <Slide index={2} className="slide">
                  <video
                    src={ViewSymptoms}
                    autoPlay
                    loop
                    muted
                    className="item"
                  />
                </Slide>
                <Slide index={3} className="slide">
                  <video
                    src={ViewTreatment}
                    autoPlay
                    loop
                    muted
                    className="item"
                  />
                </Slide>
                <Slide index={4} className="slide">
                  <video
                    src={ViewPharmacy}
                    autoPlay
                    loop
                    muted
                    className="item"
                  />
                </Slide>
                <Slide index={5} className="slide">
                  <video src={ViewGP} autoPlay loop muted className="item" />
                </Slide>
              </Slider>
              <div className="buttons-container">
                <ButtonBack className="button">&lt;</ButtonBack>
                <DotGroup />
                <ButtonNext className="button">&gt;</ButtonNext>
              </div>
            </CarouselProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
