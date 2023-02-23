import React, { useState, useMemo } from "react";

import "./style.scss";

function SelectionWheel({ onSelected }: { onSelected: any }) {
  return (
    <div className="overlay">
      <div className="selectionWheel">
        <div className="inner-left-top inner">
          <p>Dark Power</p>
        </div>
        <div className="inner-right-top inner">
          <p>Hurts</p>
        </div>
        <div className="inner-right-bottom inner">
          <p>Online</p>
        </div>
        <div className="inner-left-bottom inner">
          <p>Support</p>
        </div>

        <div className="selectionWheel--center"></div>
      </div>

      <div className="hoveritems">
        <div
          className="left-top triangle"
          onMouseEnter={(e) => onSelected("opt-1")}
        ></div>
        <div
          className="right-top triangle"
          onMouseEnter={(e) => onSelected("opt-2")}
        ></div>
        <div
          className="right-bottom triangle"
          onMouseEnter={(e) => onSelected("opt-3")}
        ></div>
        <div
          className="left-bottom triangle"
          onMouseEnter={(e) => onSelected("opt-4")}
        ></div>
        <div className="wheelCover"></div>
      </div>
    </div>
  );
}

export default SelectionWheel;
