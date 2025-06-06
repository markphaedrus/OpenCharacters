# OpenCharacters

![banner](https://user-images.githubusercontent.com/1167575/225629372-eb4de08a-ed62-4660-a83d-6e42a5c092d7.jpg)

| ⟶ [**Try it!**](https://markphaedrus.github.io/OpenCharacters) ⟵ |
| :---: |
| Similar to CharacterAI, but open source, and with much deeper character customization. |
| [Joseph Rocca's Discord Server](https://discord.gg/5tkWXJFqPV) |
| This is a fork of <https://github.com/josephrocca/OpenCharacters>. (More information at <https://github.com/josephrocca/OpenCharacters/issues/74>.) |

## Features of the fork

* Updated for compatibility with new OpenAI models.
* The UI now displays pricing info for the various models. (*Caution:* This pricing info is manually updated. You should still regularly check your OpenAI account to make sure that everything's as expected.)
* Support for generating multiple replies from a single query. This is a big time and money saver if you like to generate lots of variant replies to a single conversation prompt. For example, if you generate five replies per query, then you'll only pay once for processing the conversation history (though you'll still pay for all five replies).
* Lots of tweaks to how memories and lore are calculated, to help you balance consistency against cost.
* UI changes to help in some accessibility situations.
* Support for converting plain quotes into smart quotes or vice-versa (since OpenAI models tend to use them interchangeably), and to filter out emoji from responses, to help the conversation look more consistent.
* Tweak to local hosting support: you can now choose to turn off the CORS proxy that's normally used when retrieving lore files. That lets you host your lore files locally, if you're using a local server with CORS support.
* Switched to current versions of all the third-party libraries. 
* Keeps a running count of how many changes you've made since you last backed up your conversations, to nudge you to back up regularly.
* A number of little under-the-covers improvements.
* Updates to documentation.

## Features of the original OpenCharacters

* The whole app runs on the client side - no server other than the AI model itself. (You can run OpenCharacters [locally](docs/local-setup.md) if you want).
* All your data is stored in your browser's local storage (again, there is no server).
* Share characters with a link - all character data is embedded within the link.
* Auto-summarization algorithm (for old messages) which extends effective character memory/context size massively.
* Characters automatically compress messages into 'memories' and retrieve relevant memories based on context. Can handle as many memories as you need - tens of thousands or more.
* Add lorebook(s) to your character, and add thread-specific lore with the `/lore` command.
* Fully extensible with [custom code](docs/custom-code.md). See examples [here](docs/custom-code-examples.md).
  * Give your character access to the internet
  * Create your own slash commands
  * Give your character a video avatar (custom code has its own iframe & can display arbitrary content)
  * Create a "game master" [with a separate AI-powered process](https://tinyurl.com/5t3x8pdk) that tracks your abilities, inventory, etc.
  * Create your own memory structures (embedding, retrieval, etc.)
  * Give your character an internal thought process that runs alongside the chat
  * Give your character a voice via the browser's built-in TTS, or via an external API like ElevenLabs
  * Characters can [edit their own personality and custom code](https://tinyurl.com/4ccnn9zb) - self-improving and change over time
  * Allow your character to execute [Python](docs/running-python-code.md) or JavaScript code.
* Currently supports OpenAI APIs [and most Hugging Face models](docs/custom-models.md).
* Easily import character files and conversation data most other formats.
* Send new feature ideas or bug reports [here](https://github.com/MarkPhaedrus/OpenCharacters/issues).

## Changelog

At the moment, just the stuff mentioned in "Features of the fork" above.
