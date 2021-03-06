import React, { useState, useEffect } from "react";
import { useDispatch, connect } from "react-redux";
import PropTypes from "prop-types";
import Blockly from "blockly";
import BlocklyJS from "blockly/javascript";
import SaveOutlinedIcon from "@material-ui/icons/SaveOutlined";
import PlayCircleFilledWhiteOutlinedIcon from "@material-ui/icons/PlayCircleFilledWhiteOutlined";
import GetAppOutlinedIcon from "@material-ui/icons/GetAppOutlined";
import DeleteSweepOutlinedIcon from "@material-ui/icons/DeleteSweepOutlined";
import BlocklyWorkspace from "../../components/blockcoding/BlocklyWorkspace";
import { Block, Category } from "../../components/blockcoding/BlocklyElement";
import "../../components/blockcoding/blocks/AnalysisCNN";
import "../../components/blockcoding/blocks/AnalysisLSTM";
import "../../components/blockcoding/blocks/AnalysisProphet";
import "../../components/blockcoding/blocks/DataCrawlingPeriod";
import "../../components/blockcoding/blocks/DataCrawlingRealTime";
import "../../components/blockcoding/blocks/DataFileInput";
import "../../components/blockcoding/blocks/DataPreparation";
import "../../components/blockcoding/blocks/DataPreprocessing";
import "../../components/blockcoding/blocks/DataSelect";
import "../../components/blockcoding/blocks/ModelCNNTraining";
import "../../components/blockcoding/blocks/ModelCustomTraining";
import "../../components/blockcoding/blocks/ModelLSTMTraining";
import "../../components/blockcoding/blocks/ModelEvaluate";
import "../../components/blockcoding/blocks/ModelPredict";
import "../../components/blockcoding/blocks/ModelSelect";
import "../../components/blockcoding/blocks/LayerConvolution";
import "../../components/blockcoding/blocks/LayerMaxPooling";
import "../../components/blockcoding/blocks/LayerAveragePooling";
import "../../components/blockcoding/blocks/LayerDropout";
import "../../components/blockcoding/blocks/LayerLSTM";
import DisplayTable from "../../components/blockcoding/DisplayTable";
import DisplayChart from "../../components/blockcoding/DisplayChart";
import DisplayCode from "../../components/blockcoding/DisplayCode";
import store from "../../index.js";
import ModalNotification from "../../components/blockcoding/modals/WarningMdal";
import {
  getDataList,
  getUserDataSet,
  getUserModelSet,
  setDisplayCode,
  setDisplayData,
  setUserDataSetId,
  setModalOpen,
  setModalTitle,
  setModalContent,
} from "../../actions/index";

function BlockCoding({ spinner, modalOpen, modalTitle, modalContent }) {
  const [simpleWorkspace] = useState(React.createRef());
  const dispatch = useDispatch();

  // ?????? ?????? ?????? ??????
  const closeModal = () => {
    dispatch(setModalOpen(false));
  };
  const openSuccessModal = () => {
    dispatch(setModalTitle("success!"));
    dispatch(setModalContent("???????????? ??????????????? ?????????????????????."));
    dispatch(setModalOpen(true));
  };
  const openErrorModal = () => {
    dispatch(setModalTitle("error!"));
    dispatch(setModalContent("???????????? ???????????? ??? ????????????."));
    dispatch(setModalOpen(true));
  };

  const user = JSON.parse(
    sessionStorage.getItem(
      `firebase:authUser:${process.env.REACT_APP_FIREBASE_APIKEY}:[DEFAULT]`
    )
  );

  dispatch(getDataList());
  dispatch(getUserDataSet(user.uid));
  dispatch(getUserModelSet(user.uid));
  dispatch(setDisplayData([]));

  useEffect(() => {
    dispatch(setDisplayCode(""));
  }, []);

  // ?????? ??????
  function execute() {
    BlocklyJS.workspaceToCode(simpleWorkspace.current.workspace);
  }

  // ?????? ??????
  function workspaceStore() {
    const dataId = store.getState().userDataSetId[1];
    const workspaceXml = Blockly.Xml.workspaceToDom(
      simpleWorkspace.current.workspace
    );
    const workspaceXmlText = Blockly.Xml.domToPrettyText(workspaceXml);

    const url = "{base_url}/api/data/userdataset/xml/update";

    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_data_set_id: dataId,
        user_data_set_xml: workspaceXmlText,
      }),
    })
      .then((res) => {
        dispatch(getUserDataSet(user.uid));
        dispatch(getUserModelSet(user.uid));
        dispatch(setModalTitle("success!"));
        dispatch(setModalContent("?????????????????????."));
        dispatch(setModalOpen(true));
      })
      .catch(() => {
        dispatch(setModalTitle("error!"));
        dispatch(setModalContent("????????? ??? ??? ????????????."));
        dispatch(setModalOpen(true));
      });
  }

  // ????????? ?????? ??????
  const dataDownload = () => {
    // ???????????? ?????? ?????? ?????? data??? ?????? ?????? dataId
    const dataId = store.getState().userDataSetId[1];
    let url = "";

    // ?????? ???????????? ???????????? ?????? ?????????????????? !
    try {
      if (
        store.getState().userDataSetId[0].slice(-8) === "crawling" ||
        store.getState().userDataSetId[0] === "fileInput"
      ) {
        url = `{base_url}/api/easy/userdataset/file/${dataId}`;
        fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            if (res.status === 200) {
              location.href = url;
              openSuccessModal();
            } else {
              openErrorModal();
            }
          })
          .catch(() => {
            openErrorModal();
          });
      } else if (
        store.getState().userDataSetId[0] === "prophet" ||
        store.getState().userDataSetId[0] === "predict"
      ) {
        url = `{base_url}/csv/download/userdatapredict/${dataId}`;
        fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((res) => {
            if (res.status === 200) {
              location.href = url;
              openSuccessModal();
            } else {
              openErrorModal();
            }
          })
          .catch(() => {
            openErrorModal();
          });
      } else {
        openErrorModal();
      }
    } catch (err) {
      openErrorModal();
    }
  };

  // ?????? ????????? ????????? ??????
  const reset = () => {
    dispatch(setUserDataSetId(["initialize", -1]));
    dispatch(setDisplayData([]));
    dispatch(setDisplayCode(""));
    simpleWorkspace.current.workspace.clear();
    dispatch(setModalTitle("success!"));
    dispatch(setModalContent("????????????????????????."));
    dispatch(setModalOpen(true));
  };

  return (
    <div className="container blockCoding">
      <div className="buttonArea">
        <button className="button executeButton" onClick={execute}>
          <PlayCircleFilledWhiteOutlinedIcon /> &nbsp; ??????
        </button>
        <button className="button storeButton" onClick={workspaceStore}>
          <SaveOutlinedIcon /> &nbsp; ??????
        </button>
        <button className="button downloadButton" onClick={dataDownload}>
          <GetAppOutlinedIcon /> &nbsp; ????????? ??????
        </button>
        <button className="button resetButton" onClick={reset}>
          <DeleteSweepOutlinedIcon /> &nbsp; ????????? ?????????
        </button>
      </div>

      {spinner.spinner ? (
        <div className="loading">
          <p className="blinking"> ??? ??? &nbsp; ??? ??? ??? &nbsp;&nbsp; </p>
          <div className="sk-fading-circle">
            <div className="sk-circle1 sk-circle"></div>
            <div className="sk-circle2 sk-circle"></div>
            <div className="sk-circle3 sk-circle"></div>
            <div className="sk-circle4 sk-circle"></div>
            <div className="sk-circle5 sk-circle"></div>
            <div className="sk-circle6 sk-circle"></div>
            <div className="sk-circle7 sk-circle"></div>
            <div className="sk-circle8 sk-circle"></div>
            <div className="sk-circle9 sk-circle"></div>
            <div className="sk-circle10 sk-circle"></div>
            <div className="sk-circle11 sk-circle"></div>
            <div className="sk-circle12 sk-circle"></div>
          </div>
        </div>
      ) : (
        <div className="welcome">
          <p> Welcome FlaNET World! </p>
        </div>
      )}

      <BlocklyWorkspace
        ref={simpleWorkspace}
        readOnly={false}
        trashcan={true}
        move={{
          scrollbars: true,
          drag: true,
          wheel: true,
        }}
        initialXml={`
          <xml xmlns="http://www.w3.org/1999/xhtml">
          </xml>
        `}
      >
        <React.Fragment>
          <Category name="????????? ??????">
            <Block type="DataCrawlingRealTime" />
            <Block type="DataCrawlingPeriod" />
            <Block type="DataFileInput" />
            <Block type="DataSelect" />
          </Category>
          <Category name="????????? ??????">
            <Block type="DataPreprocessing" />
            <Block type="DataPreparation" />
          </Category>
          <Category name="?????? ????????? ?????????">
            <Block type="AnalysisCNN" />
            <Block type="AnalysisLSTM" />
            <Block type="AnalysisProphet" />
          </Category>
          <Category name="????????? ?????? ??????">
            <Block type="ModelCNNTraining" />
            <Block type="ModelLSTMTraining" />
            <Block type="ModelSelect" />
          </Category>
          <Category name="????????? ?????? ?????????">
            <Block type="ModelCustomTraining" />
            <Block type="Conv1D" />
            <Block type="MaxPooling1D" />
            <Block type="AveragePooling1D" />
            <Block type="Dropout" />
            <Block type="LSTM" />
          </Category>
          <Category name="?????? ?????? ??? ????????? ??????">
            <Block type="ModelEvaluate" />
            <Block type="ModelPredict" />
          </Category>
        </React.Fragment>
      </BlocklyWorkspace>
      <div className="visualizationArea">
        <DisplayTable />
        <DisplayChart />
        <DisplayCode />
      </div>
      <React.Fragment>
        <ModalNotification
          open={modalOpen}
          close={closeModal}
          title={modalTitle}
          content={modalContent}
        ></ModalNotification>
      </React.Fragment>
    </div>
  );
}

BlockCoding.propTypes = {
  spinner: PropTypes.bool,
  modalOpen: PropTypes.bool,
  modalTitle: PropTypes.string,
  modalContent: PropTypes.string,
};

export default connect((state) => ({
  spinner: state.spinner,
  modalOpen: state.modalOpen,
  modalTitle: state.modalTitle,
  modalContent: state.modalContent,
}))(BlockCoding);
