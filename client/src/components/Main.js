import React, { Component } from "react";
import Identicon from "identicon.js";

class Main extends Component {
  render() {
    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: "500px" }}
          >
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <h2>Share Image</h2>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const description = this.imageDescription.value;
                  const category = this.category.value;
                  this.props.uploadImage(description, category);
                }}
              >
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png, .bmp, .gif"
                  onChange={this.props.captureFile}
                />
                <div className="form-group mr-sm-2">
                  <br></br>

                  <input
                    id="category"
                    type="Category"
                    ref={(input) => {
                      this.category = input;
                    }}
                    className="form-control"
                    placeholder="Add Category"
                    required
                  />

                  <input
                    id="imageDescription"
                    type="text"
                    ref={(input) => {
                      this.imageDescription = input;
                    }}
                    className="form-control"
                    placeholder="Image description..."
                    required
                  />
                </div>
                <button type="submit" class="btn btn-primary btn-block btn-lg">
                  Upload!
                </button>
              </form>
              <p>&nbsp;</p>
              {this.props.images.length == 0 ? (
                <h5 style={{ color: "red", textAlign: "center" }}>
                  Nothing to show
                </h5>
              ) : (
                this.props.images.map((image, key) => {
                  return (
                    <div className="card mb-4" key={key}>
                      <div className="card-header">
                        <img
                          className="mr-2"
                          width="30"
                          height="30"
                          src={`data:image/png;base64,${new Identicon(
                            image.author,
                            30
                          ).toString()}`}
                        />
                        <small className="text-muted">{image.author}</small>
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={image.id}
                          onClick={(event) => {
                            this.props.follow(image.author);
                          }}
                        >
                          Follow
                        </button>
                      </div>
                      <ul
                        id="imageList"
                        className="list-group list-group-flush"
                      >
                        <li className="list-group-item">
                          <p class="text-center">
                            <img
                              src={`https://ipfs.infura.io/ipfs/${image.hash}`}
                              style={{ maxWidth: "420px" }}
                            />
                          </p>
                          <p>{image.category}</p>
                          <p>{image.description}</p>
                        </li>
                        <li className="list-group-item">
                          {this.props.tips[key].map((t, i) => (
                            <p key={i}>
                              {t.tipper} tipped
                              {" " +
                                window.web3.utils.fromWei(
                                  t.amount.toString(),
                                  "Ether"
                                )}
                              {"  "}
                              ETH
                            </p>
                          ))}
                        </li>
                        <li key={key} className="list-group-item py-2">
                          <small className="float-left mt-1 text-muted">
                            TIPS:{" "}
                            {window.web3.utils.fromWei(
                              image.tipAmount.toString(),
                              "Ether"
                            )}{" "}
                            ETH
                          </small>
                          <input
                            type="number"
                            className="m-2"
                            placeholder="Amount in ETH"
                            ref={(input) => {
                              this.amountToTip = input;
                            }}
                          />
                          <button
                            className="btn btn-link btn-sm float-right pt-0"
                            name={image.id}
                            onClick={(event) => {
                              let tipAmount = window.web3.utils.toWei(
                                this.amountToTip.value,
                                "Ether"
                              );
                              console.log(event.target.name, tipAmount);
                              this.props.tipImageOwner(
                                event.target.name,
                                tipAmount
                              );
                            }}
                          >
                            TIP
                          </button>
                        </li>
                      </ul>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
        <br></br>
        <div>
          <h4>Your Followers</h4>
          {this.props.followers.map((f, i) => (
            <p key={i}>{f}</p>
          ))}
          <h4>Your Following</h4>
          {this.props.followings.map((f, i) => (
            <p key={i}>{f}</p>
          ))}
        </div>

        <br></br>
      </div>
    );
  }
}

export default Main;
