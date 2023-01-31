import axios from "axios";
import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends Component {
  static defaultProps = {
    numJokesToGet: 10,
  };
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false,
    };
    // Unique Jokes
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
  }

  componentDidMount() {
    // check if jokes parsed from localStorage first before getting new jokes
    if (this.state.jokes.length === 0) {
      this.setState({ loading: true }, this.getJokes);
    }
  }
  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        let newJoke = res.data.joke;

        if (!this.seenJokes.has(newJoke)) {
          jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
        } else {
          console.log("FOUND A DUPLICATE!");
        }
      }

      this.setState(
        (prevState) => ({
          loading: false,
          jokes: [...prevState.jokes, ...jokes].sort(
            (a, b) => b.votes - a.votes
          ), // add new jokes and not replace old jokes
        }),
        // setState callback function
        () =>
          window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
      );
    } catch (error) {
      alert(error);
      this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(
      (prevState) => {
        return {
          jokes: prevState.jokes.map((joke) => {
            return joke.id === id
              ? { ...joke, votes: joke.votes + delta }
              : joke;
          }),
        };
      },
      // update localStorage
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  handleClick = () => {
    this.setState({ loading: true }, this.getJokes);
  };

  render() {
    if (this.state.loading) {
      return (
        <div className='JokeList-spinner'>
          <i className='far fa-8x fa-laugh fa-spin' />
          <h1 className='JokeList-title'>Loading...</h1>
        </div>
      );
    }

    // else if not loading
    return (
      <div className='JokeList'>
        <div className='JokeList-sidebar'>
          <h1 className='JokeList-title'>
            <span>Dad</span> Jokes
          </h1>
          <img
            src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg'
            alt='laughing emoji'
          />
          <button className='JokeList-getmore' onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>

        <div className='JokeList-jokes'>
          {this.state.jokes.map((joke) => (
            <Joke
              key={joke.id}
              votes={joke.votes}
              text={joke.text}
              upvote={() => this.handleVote(joke.id, 1)}
              downvote={() => this.handleVote(joke.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default JokeList;
