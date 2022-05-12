// @ts-ignore
import React from "react";
import { Button } from "../../components/bootstrap"
import TrialCard from "../../components/TrialCard";
import {JsPsych} from "jspsych";
import Stage0MDX from "./instructions/stage0.mdx"
import Stage1MDX from "./instructions/stage1.mdx"
import Stage2MDX from "./instructions/stage2.mdx"
import Stage3MDX from "./instructions/stage3.mdx"
import Stage4MDX from "./instructions/stage4.mdx"
import Stage5MDX from "./instructions/stage5.mdx"
import ReactPlugin from "../../plugins/react";
import ReactDOMExtension from "../../extensions/react";

const readInstructions = (jsPsych: JsPsych) => {
  return () => {
    jsPsych.finishTrial()
  }
}

export const DefaultFooter = ({jsPsych, ...rest}) => {
  return <Button.Next onClick={readInstructions(jsPsych)} />
}

const Stage0 = ({ jsPsych, ...rest }) => {
  const Header = () => "Welcome to our study!"
  const Body = () => <Stage0MDX />
  
  const props = {
    jsPsych,
    Header,
    Body,
    Footer: () => <DefaultFooter jsPsych={jsPsych} />,
    klass: {card: null, header: null, body: null, footer: null}
  }
  return <TrialCard {...props} />
}

const Stage1 = ({jsPsych, ...rest}) => {
  const Header = () => "Scenario Descriptions"
  const Body = () => <Stage1MDX />
  
  const props = {
    jsPsych,
    Header,
    Body,
    Footer: () => <DefaultFooter jsPsych={jsPsych} />,
    klass: {card: null, header: null, body: null, footer: null}
  }
  
  return <TrialCard {...props} />
}

const Stage2 = ({jsPsych, ...rest}) => {
  const Header = () => "We will be providing 4 different examples."
  const Body = () => <Stage2MDX />
  
  const props = {
    jsPsych,
    Header,
    Body,
    Footer: () => <DefaultFooter jsPsych={jsPsych} />,
    klass: {card: null, header: null, body: null, footer: null}
  }
  
  return <TrialCard {...props} />
}

const Stage3 = ({jsPsych, ...rest}) => {
  const Header = () => "Examples"
  const Body = () => <Stage3MDX />
  
  const props = {
    jsPsych,
    Header,
    Body,
    Footer: () => <DefaultFooter jsPsych={jsPsych} />,
    klass: {card: null, header: null, body: null, footer: null}
  }
  
  return <TrialCard {...props} />
}

const Stage4 = ({jsPsych, ...rest}) => {
  const Header = () => "Examples"
  const Body = () => <Stage4MDX />
  
  const props = {
    jsPsych,
    Header,
    Body,
    Footer: () => <DefaultFooter jsPsych={jsPsych} />,
    klass: {card: null, header: null, body: null, footer: null}
  }
  
  return <TrialCard {...props} />
}

const Stage5 = ({jsPsych, ...rest}) => {
  const Header = () => "Examples"
  const Body = () => <Stage5MDX />
  
  const props = {
    jsPsych,
    Header,
    Body,
    Footer: () => <DefaultFooter jsPsych={jsPsych} />,
    klass: {card: null, header: null, body: null, footer: null}
  }
  
  return <TrialCard {...props} />
}

function makePlugin(Stage) {
  return {
    type: ReactPlugin,
    extensions: [{type: ReactDOMExtension, params: {}}],
    component: (props) => <Stage {...props} />
  }
}

export default [
  makePlugin(Stage0),
  makePlugin(Stage1),
  makePlugin(Stage2),
  makePlugin(Stage3),
  makePlugin(Stage4),
  makePlugin(Stage5),
]