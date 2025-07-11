# MIDI Message Reference for Interactive Sound Installation

This document lists essential MIDI messages for controlling the following devices in an interactive installation:
- **Elektron Digitakt**
- **Nord Drum 2**
- **Conductive Labs NDLR**
- **Elektron Syntakt**
- **Elektron Digitone**

---

## Elektron Digitakt

| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| Trigger Track (Pad)    | Note On/Off      | 1-8     | 36-43   | 0-127       | Each track responds to a MIDI note (default: 36=C1 for Track 1, 37=C#1 for Track 2, etc.) |
| Mute Track             | CC               | 1-8     | 94      | 0/127       | 0 = unmute, 127 = mute |
| Track Level            | CC               | 1-8     | 7       | 0-127       | Track volume |
| Filter Cutoff          | CC               | 1-8     | 74      | 0-127       | Filter cutoff |
| Sample Select          | CC               | 1-8     | 16      | 0-127       | Select sample |
| FX Send (Delay/Reverb) | CC               | 1-8     | 92/93   | 0-127       | Delay (92), Reverb (93) send |

---

## Nord Drum 2

| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| Trigger Drum            | Note On/Off      | 10      | 60-65   | 0-127       | MIDI notes 60-65 trigger channels 1-6 |
| Pitch                   | CC               | 10      | 16-21   | 0-127       | CC16-21 control pitch for channels 1-6 |
| Decay                   | CC               | 10      | 22-27   | 0-127       | CC22-27 control decay |
| Harmonics               | CC               | 10      | 28-33   | 0-127       | CC28-33 control harmonics |
| Filter                  | CC               | 10      | 34-39   | 0-127       | CC34-39 control filter |
| Level                   | CC               | 10      | 40-45   | 0-127       | CC40-45 control level |

---

## Conductive Labs NDLR

| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| Start/Stop              | CC               | 1       | 120     | 0/127       | 127 = Start, 0 = Stop |
| Motif Trigger           | Note On/Off      | 1-4     | 48-72   | 0-127       | Motif channels respond to notes |
| Chord Change            | CC               | 1       | 20      | 0-127       | Change chord |
| Key Change              | CC               | 1       | 21      | 0-127       | Change key |
| Pattern Select          | CC               | 1       | 22      | 0-127       | Select pattern |
| Rhythm Select           | CC               | 1       | 23      | 0-127       | Select rhythm |
| Pad Trigger             | Note On/Off      | 1       | 36-96   | 0-127       | Pad notes |

---

## Elektron Syntakt

| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| Trigger Track (Pad)    | Note On/Off      | 1-12    | 36-47   | 0-127       | Each track responds to a MIDI note (default: 36=C1 for Track 1, 37=C#1 for Track 2, etc.) |
| Mute Track             | CC               | 1-12    | 94      | 0/127       | 0 = unmute, 127 = mute |
| Track Level            | CC               | 1-12    | 7       | 0-127       | Track volume |
| Filter Cutoff          | CC               | 1-12    | 74      | 0-127       | Filter cutoff |
| FX Send (Delay/Reverb) | CC               | 1-12    | 92/93   | 0-127       | Delay (92), Reverb (93) send |
| Parameter Lock         | CC               | 1-12    | 16-95   | 0-127       | Assignable to various parameters |

---

## Elektron Digitone

| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| Trigger Track (Pad)    | Note On/Off      | 1-4     | 60-63   | 0-127       | MIDI notes 60-63 trigger tracks 1-4 |
| Mute Track             | CC               | 1-4     | 94      | 0/127       | 0 = unmute, 127 = mute |
| Track Level            | CC               | 1-4     | 7       | 0-127       | Track volume |
| Filter Cutoff          | CC               | 1-4     | 74      | 0-127       | Filter cutoff |
| Algorithm Select       | CC               | 1-4     | 16      | 0-127       | Select FM algorithm |
| Parameter Lock         | CC               | 1-4     | 17-95   | 0-127       | Assignable to various parameters |
| FX Send (Delay/Reverb) | CC               | 1-4     | 92/93   | 0-127       | Delay (92), Reverb (93) send |

---

## Extra MIDI Messages for Sound Influence

### Elektron Digitakt
| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| LFO Depth              | CC               | 1-8     | 23      | 0-127       | LFO modulation depth |
| LFO Speed              | CC               | 1-8     | 24      | 0-127       | LFO rate |
| Overdrive Amount       | CC               | 1-8     | 17      | 0-127       | Overdrive effect |
| Pan                    | CC               | 1-8     | 10      | 0-127       | Stereo pan |
| Attack                 | CC               | 1-8     | 71      | 0-127       | Envelope attack |
| Release                | CC               | 1-8     | 72      | 0-127       | Envelope release |

### Elektron Syntakt
| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| LFO Depth              | CC               | 1-12    | 23      | 0-127       | LFO modulation depth |
| LFO Speed              | CC               | 1-12    | 24      | 0-127       | LFO rate |
| Overdrive Amount       | CC               | 1-12    | 17      | 0-127       | Overdrive effect |
| Pan                    | CC               | 1-12    | 10      | 0-127       | Stereo pan |
| Attack                 | CC               | 1-12    | 71      | 0-127       | Envelope attack |
| Release                | CC               | 1-12    | 72      | 0-127       | Envelope release |
| FX Track Parameters    | CC               | 13      | 16-95   | 0-127       | FX track controls |

### Elektron Digitone
| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| LFO Depth              | CC               | 1-4     | 23      | 0-127       | LFO modulation depth |
| LFO Speed              | CC               | 1-4     | 24      | 0-127       | LFO rate |
| Overdrive Amount       | CC               | 1-4     | 17      | 0-127       | Overdrive effect |
| Pan                    | CC               | 1-4     | 10      | 0-127       | Stereo pan |
| Attack                 | CC               | 1-4     | 71      | 0-127       | Envelope attack |
| Release                | CC               | 1-4     | 72      | 0-127       | Envelope release |
| Chorus Depth           | CC               | 1-4     | 93      | 0-127       | Chorus effect depth |

### Nord Drum 2
| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| Noise Level            | CC               | 10      | 46-51   | 0-127       | CC46-51 control noise for channels 1-6 |
| Tone Level             | CC               | 10      | 52-57   | 0-127       | CC52-57 control tone for channels 1-6 |
| Click Level            | CC               | 10      | 58-63   | 0-127       | CC58-63 control click for channels 1-6 |
| EQ Low                 | CC               | 10      | 64-69   | 0-127       | CC64-69 control EQ low |
| EQ High                | CC               | 10      | 70-75   | 0-127       | CC70-75 control EQ high |

### Conductive Labs NDLR
| Function                | MIDI Message Type | Channel | Note/CC | Value Range | Description |
|------------------------|------------------|---------|---------|-------------|-------------|
| Pad Chord Spread       | CC               | 1       | 24      | 0-127       | Spread pad chord notes |
| Motif Length           | CC               | 1-4     | 25      | 0-127       | Motif length |
| Motif Velocity         | CC               | 1-4     | 26      | 0-127       | Motif velocity |
| Pad Velocity           | CC               | 1       | 27      | 0-127       | Pad velocity |
| Arp Rate               | CC               | 1       | 28      | 0-127       | Arpeggiator rate |

---

## General MIDI Message Format

- **Note On**: `[0x90 + channel, note, velocity]`
- **Note Off**: `[0x80 + channel, note, velocity]`
- **Control Change (CC)**: `[0xB0 + channel, cc_number, value]`

---

## Usage Notes
- Set the correct MIDI channel for each device.
- Velocity and CC values can be mapped to installation parameters (e.g., face position, movement).
- For multi-person setups, assign each person to a device or channel.

---

For more details, refer to each device's MIDI implementation chart.
