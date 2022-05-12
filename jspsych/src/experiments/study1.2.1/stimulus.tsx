// @ts-ignore
import React from "react";
import {JsPsych} from "jspsych";

import TrialCard from "../../components/TrialCard";
import { Button } from "../../components/bootstrap";
import {DefaultFooter} from "./instructions";

import ReactPlugin from "../../plugins/react";
import FinalFormPlugin from "../../plugins/final-form";
import ReactDOMExtension from "../../extensions/react";

import RefresherMDX from "./stimulus/phase1.mdx"
import FillInTheBlank from "./stimulus/phase2"

const Refresher = ({jsPsych, ...rest}) => {
  const Header = () => "Instructions"
  const Footer = () => <DefaultFooter jsPsych={jsPsych} />
  const Body = () => <RefresherMDX />
  
  const props = {
    jsPsych, Header, Footer, Body,
    klass: {card: null, header: null, body: null, footer: null}
  }
  return <TrialCard {...props} />
}

const Stimuli = ({jsPsych, ...rest}) => {
  return <FillInTheBlank jsPsych={jsPsych} {...rest} />
}

const buildStimuli = (stimulus, jsPsych) => {
  const extensions = [{type: ReactDOMExtension, params: {}}]
  
  const instructionsTrial = {
    type: ReactPlugin,
    component: (props) => <Refresher {...stimulus} {...props} />,
    extensions,
  }
  
  const choiceTrial = {
    type: FinalFormPlugin,
    component: (props) => <Stimuli {...stimulus} {...props} />,
    extensions,
  }
  
  return [instructionsTrial, choiceTrial]
}
export default buildStimuli