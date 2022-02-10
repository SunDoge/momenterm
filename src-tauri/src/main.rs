#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::{
  collections::HashMap,
  sync::{mpsc::Sender, Arc, Mutex},
};

use portable_pty::{native_pty_system, CommandBuilder, PtyPair, PtySize};
use tauri::{State, Window};

pub struct Terminal {
  uuid: String,
  sender: Sender<String>,
  pair: PtyPair,
}

struct TerminalDatabase(Arc<Mutex<HashMap<String, Terminal>>>);

impl TerminalDatabase {
  pub fn new() -> Self {
    TerminalDatabase(Arc::new(Mutex::new(HashMap::new())))
  }
}

#[derive(serde::Serialize)]
struct Payload {
  message: Vec<u8>,
}

#[tauri::command]
fn new_terminal(
  uuid: String,
  shell: String,
  rows: u16,
  cols: u16,
  window: Window,
  state: State<'_, TerminalDatabase>,
) -> String {
  let pty_system = native_pty_system();
  let pair = pty_system
    .openpty(PtySize {
      rows,
      cols,
      pixel_width: 0,
      pixel_height: 0,
    })
    .expect("fail to openpty");

  let cmd = CommandBuilder::new(shell);

  let child = pair
    .slave
    .spawn_command(cmd)
    .expect("fail to spawn command");

  let mut reader = pair
    .master
    .try_clone_reader()
    .expect("fail to clone reader");
  let mut writer = pair
    .master
    .try_clone_writer()
    .expect("fail to clone writer");

  let event_name = format!("terminal/{}", uuid);
  let event_name_cloned = event_name.clone();
  std::thread::spawn(move || {
    let mut buf = vec![0u8; 1024];

    while let Ok(len) = reader.read(&mut buf) {
      if len == 0 {
        break;
      }

      window.emit(
        &event_name_cloned,
        Payload {
          message: buf[..len].to_vec(),
        },
      );
    }
  });

  let (sender, receiver) = std::sync::mpsc::channel::<String>();
  std::thread::spawn(move || {
    while let Ok(v) = receiver.recv() {
      writer.write(v.as_bytes());
    }
  });

  let terminal = Terminal { uuid, sender, pair };

  {
    let mut db = state.0.lock().unwrap();
    db.insert(terminal.uuid.clone(), terminal);
  }

  event_name
}

#[tauri::command]
fn send_data(uuid: String, data: String, state: State<'_, TerminalDatabase>) {
  // println!("data: {}", data);
  {
    let db = state.0.lock().unwrap();
    if let Some(terminal) = db.get(&uuid) {
      terminal.sender.send(data);
    }
  }
}

#[tauri::command]
fn resize_terminal(uuid: String, rows: u16, cols: u16, state: State<'_, TerminalDatabase>) {
  {
    let db = state.0.lock().unwrap();
    if let Some(terminal) = db.get(&uuid) {
      terminal
        .pair
        .master
        .resize(PtySize {
          rows,
          cols,
          pixel_width: 0,
          pixel_height: 0,
        })
        .expect("fail to resize");
    }
  }
}

#[tauri::command]
fn send_binary(data: String) {
  println!("binary: {:?}", data);
}

fn main() {
  tauri::Builder::default()
    .manage(TerminalDatabase::new())
    .invoke_handler(tauri::generate_handler![
      send_data,
      send_binary,
      new_terminal,
      resize_terminal
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
