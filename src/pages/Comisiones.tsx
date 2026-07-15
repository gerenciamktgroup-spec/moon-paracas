import React, { useState, useMemo, useEffect } from "react";
import { 
  Calculator, Download, Printer, Search, Users, Trophy, Target, 
  Building2, ChevronDown, ChevronUp, X, BarChart3, TrendingUp, 
  Wallet, Tent, DollarSign, PieChart, Info, Sparkles, CheckCircle2, 
  Copy, Share2, ClipboardList, Trash2, CheckCircle, ShieldAlert
} from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";

// ================================================================
// TYPES & INTERFACES
// ================================================================
interface LotData {
  id: string;
  nombre: string;
  manzana: string;
  tipologia: string;
  area: string;
  precio: number;
  estado: string;
}

interface DomeLot {
  id: string;
  nombre: string;
  fila: string;
  tipologia: string;
  areaM2: number;
  domoM2: number;
  precioFounder: number;
  precioComfort: number;
  costoTerreno: number;
  inversionMaxDomo: number;
  gananciaMinFounder: number;
  gananciaMinComfort: number;
  estado: string;
}

interface SeparationRecord {
  id: string; // Unique reservation doc ID in Firestore
  lotId: string;
  proyecto: "Moon Paracas" | "Paracas Dome";
  clienteName: string;
  montoSeparacion: number;
  fecha: string;
  originalEstado: string;
}

// ================================================================
// MOON PARACAS RAW DATA
// ================================================================
const MOON_RAW_DATA: LotData[] = [
  // M1
  { id: "L001", nombre: "Lote 1", manzana: "M1", tipologia: "Lote Estándar", area: "225,54", precio: 27065, estado: "Disponible" },
  { id: "L002", nombre: "Lote 2", manzana: "M1", tipologia: "Lote Estándar", area: "224,67", precio: 26960, estado: "Disponible" },
  { id: "L003", nombre: "Lote 3", manzana: "M1", tipologia: "Lote Estándar", area: "224,37", precio: 26924, estado: "Disponible" },
  { id: "L004", nombre: "Lote 4", manzana: "M1", tipologia: "Lote Estándar", area: "225,14", precio: 27017, estado: "Disponible" },
  { id: "L005", nombre: "Lote 5", manzana: "M1", tipologia: "Lote Estándar", area: "226,12", precio: 27134, estado: "Vendido" },
  { id: "L006", nombre: "Lote 6", manzana: "M1", tipologia: "Lote Estándar", area: "227,66", precio: 27319, estado: "Disponible" },
  { id: "L007", nombre: "Lote 7", manzana: "M1", tipologia: "Lote Estándar", area: "229,65", precio: 27558, estado: "Disponible" },
  // M2
  { id: "L008", nombre: "Lote 8", manzana: "M2", tipologia: "Lote Estándar", area: "230,62", precio: 27674, estado: "Disponible" },
  { id: "L009", nombre: "Lote 9", manzana: "M2", tipologia: "Lote Estándar", area: "231,26", precio: 27751, estado: "Disponible" },
  { id: "L010", nombre: "Lote 10", manzana: "M2", tipologia: "Lote Estándar", area: "231,58", precio: 27790, estado: "Disponible" },
  { id: "L011", nombre: "Lote 11", manzana: "M2", tipologia: "Lote Estándar", area: "231,89", precio: 27827, estado: "Disponible" },
  { id: "L012", nombre: "Lote 12", manzana: "M2", tipologia: "Lote Estándar", area: "232,20", precio: 27864, estado: "Disponible" },
  { id: "L013", nombre: "Lote 13", manzana: "M2", tipologia: "Lote Estándar", area: "232,53", precio: 27904, estado: "Disponible" },
  { id: "L014", nombre: "Lote 14", manzana: "M2", tipologia: "Lote Estándar", area: "232,84", precio: 27941, estado: "Separado" },
  { id: "L015", nombre: "Lote 15", manzana: "M2", tipologia: "Lote Estándar", area: "233,15", precio: 27978, estado: "Disponible" },
  { id: "L016", nombre: "Lote 16", manzana: "M2", tipologia: "Lote Estándar", area: "233,46", precio: 28015, estado: "Disponible" },
  { id: "L017", nombre: "Lote 17", manzana: "M2", tipologia: "Lote Estándar", area: "233,77", precio: 28052, estado: "Disponible" },
  // M3
  { id: "L018", nombre: "Lote 18", manzana: "M3", tipologia: "Lote Estándar", area: "242,86", precio: 29143, estado: "Disponible" },
  { id: "L019", nombre: "Lote 19", manzana: "M3", tipologia: "Lote Estándar", area: "241,12", precio: 28934, estado: "Disponible" },
  { id: "L020", nombre: "Lote 20", manzana: "M3", tipologia: "Lote Estándar", area: "239,55", precio: 28746, estado: "Disponible" },
  { id: "L021", nombre: "Lote 21", manzana: "M3", tipologia: "Lote Estándar", area: "238,43", precio: 28612, estado: "Disponible" },
  { id: "L022", nombre: "Lote 22", manzana: "M3", tipologia: "Lote Estándar", area: "238,17", precio: 28580, estado: "Disponible" },
  { id: "L023", nombre: "Lote 23", manzana: "M3", tipologia: "Lote Estándar", area: "238,37", precio: 28604, estado: "Disponible" },
  { id: "L024", nombre: "Lote 24", manzana: "M3", tipologia: "Lote Estándar", area: "239,29", precio: 28715, estado: "Disponible" },
  { id: "L025", nombre: "Lote 25", manzana: "M3", tipologia: "Lote Estándar", area: "240,86", precio: 28903, estado: "Disponible" },
  { id: "L026", nombre: "Lote 26", manzana: "M3", tipologia: "Lote Estándar", area: "242,97", precio: 29156, estado: "Disponible" },
  // M4
  { id: "L027", nombre: "Lote 27", manzana: "M4", tipologia: "Lote Estándar", area: "155,33", precio: 18640, estado: "Disponible" },
  { id: "L028", nombre: "Lote 28", manzana: "M4", tipologia: "Lote Estándar", area: "154,84", precio: 18581, estado: "Disponible" },
  { id: "L029", nombre: "Lote 29", manzana: "M4", tipologia: "Lote Estándar", area: "154,75", precio: 18570, estado: "Disponible" },
  { id: "L030", nombre: "Lote 30", manzana: "M4", tipologia: "Lote Estándar", area: "155,40", precio: 18648, estado: "Disponible" },
  { id: "L031", nombre: "Lote 31", manzana: "M4", tipologia: "Lote Estándar", area: "156,18", precio: 18742, estado: "Disponible" },
  { id: "L032", nombre: "Lote 32", manzana: "M4", tipologia: "Lote Estándar", area: "157,33", precio: 18880, estado: "Disponible" },
  { id: "L033", nombre: "Lote 33", manzana: "M4", tipologia: "Lote Estándar", area: "158,77", precio: 19052, estado: "Vendido" },
  // M5
  { id: "L034", nombre: "Lote 34", manzana: "M5", tipologia: "Lote Estándar", area: "159,37", precio: 19124, estado: "Disponible" },
  { id: "L035", nombre: "Lote 35", manzana: "M5", tipologia: "Lote Estándar", area: "159,58", precio: 19150, estado: "Disponible" },
  { id: "L036", nombre: "Lote 36", manzana: "M5", tipologia: "Lote Estándar", area: "159,80", precio: 19176, estado: "Disponible" },
  { id: "L037", nombre: "Lote 37", manzana: "M5", tipologia: "Lote Estándar", area: "160,01", precio: 19201, estado: "Disponible" },
  { id: "L038", nombre: "Lote 38", manzana: "M5", tipologia: "Lote Estándar", area: "160,23", precio: 19228, estado: "Disponible" },
  { id: "L039", nombre: "Lote 39", manzana: "M5", tipologia: "Lote Estándar", area: "160,45", precio: 19254, estado: "Disponible" },
  { id: "L040", nombre: "Lote 40", manzana: "M5", tipologia: "Lote Estándar", area: "160,67", precio: 19280, estado: "Disponible" },
  { id: "L041", nombre: "Lote 41", manzana: "M5", tipologia: "Lote Estándar", area: "160,88", precio: 19306, estado: "Disponible" },
  { id: "L042", nombre: "Lote 42", manzana: "M5", tipologia: "Lote Estándar", area: "161,10", precio: 19332, estado: "Disponible" },
  { id: "L043", nombre: "Lote 43", manzana: "M5", tipologia: "Lote Estándar", area: "161,31", precio: 19357, estado: "Disponible" },
  // M6
  { id: "L044", nombre: "Lote 44", manzana: "M6", tipologia: "Lote Estándar", area: "167,41", precio: 20089, estado: "Disponible" },
  { id: "L045", nombre: "Lote 45", manzana: "M6", tipologia: "Lote Estándar", area: "166,06", precio: 19927, estado: "Disponible" },
  { id: "L046", nombre: "Lote 46", manzana: "M6", tipologia: "Lote Estándar", area: "165,05", precio: 19806, estado: "Disponible" },
  { id: "L047", nombre: "Lote 47", manzana: "M6", tipologia: "Lote Estándar", area: "164,39", precio: 19727, estado: "Separado" },
  { id: "L048", nombre: "Lote 48", manzana: "M6", tipologia: "Lote Estándar", area: "164,33", precio: 19720, estado: "Disponible" },
  { id: "L049", nombre: "Lote 49", manzana: "M6", tipologia: "Lote Estándar", area: "164,60", precio: 19752, estado: "Disponible" },
  { id: "L050", nombre: "Lote 50", manzana: "M6", tipologia: "Lote Estándar", area: "165,35", precio: 19842, estado: "Disponible" },
  { id: "L051", nombre: "Lote 51", manzana: "M6", tipologia: "Lote Estándar", area: "166,53", precio: 19984, estado: "Disponible" },
  { id: "L052", nombre: "Lote 52", manzana: "M6", tipologia: "Lote Estándar", area: "168,05", precio: 20166, estado: "Disponible" },
  // M7
  { id: "L053", nombre: "Lote 53", manzana: "M7", tipologia: "Lote Tiny House", area: "112,49", precio: 13499, estado: "Disponible" },
  { id: "L054", nombre: "Lote 54", manzana: "M7", tipologia: "Lote Tiny House", area: "112,20", precio: 13464, estado: "Disponible" },
  { id: "L055", nombre: "Lote 55", manzana: "M7", tipologia: "Lote Tiny House", area: "112,21", precio: 13465, estado: "Separado" },
  { id: "L056", nombre: "Lote 56", manzana: "M7", tipologia: "Lote Tiny House", area: "112,75", precio: 13530, estado: "Disponible" },
  { id: "L057", nombre: "Lote 57", manzana: "M7", tipologia: "Lote Tiny House", area: "113,37", precio: 13604, estado: "Disponible" },
  { id: "L058", nombre: "Lote 58", manzana: "M7", tipologia: "Lote Tiny House", area: "114,24", precio: 13709, estado: "Disponible" },
  { id: "L059", nombre: "Lote 59", manzana: "M7", tipologia: "Lote Tiny House", area: "115,32", precio: 13838, estado: "Disponible" },
  { id: "L060", nombre: "Lote 60", manzana: "M7", tipologia: "Lote Tiny House", area: "112,43", precio: 6746, estado: "En Oferta" },
  { id: "L061", nombre: "Lote 61", manzana: "M7", tipologia: "Lote Tiny House", area: "112,18", precio: 13462, estado: "Separado" },
  { id: "L062", nombre: "Lote 62", manzana: "M7", tipologia: "Lote Tiny House", area: "112,22", precio: 6733, estado: "En Oferta" },
  { id: "L063", nombre: "Lote 63", manzana: "M7", tipologia: "Lote Tiny House", area: "112,79", precio: 13535, estado: "Disponible" },
  { id: "L064", nombre: "Lote 64", manzana: "M7", tipologia: "Lote Tiny House", area: "113,43", precio: 6806, estado: "En Oferta" },
  { id: "L065", nombre: "Lote 65", manzana: "M7", tipologia: "Lote Tiny House", area: "114,33", precio: 6860, estado: "En Oferta" },
  { id: "L066", nombre: "Lote 66", manzana: "M7", tipologia: "Lote Tiny House", area: "115,41", precio: 13849, estado: "Disponible" },
  // M8
  { id: "L067", nombre: "Lote 67", manzana: "M8", tipologia: "Lote Tiny House", area: "115,71", precio: 13885, estado: "Disponible" },
  { id: "L068", nombre: "Lote 68", manzana: "M8", tipologia: "Lote Tiny House", area: "115,75", precio: 13890, estado: "Disponible" },
  { id: "L069", nombre: "Lote 69", manzana: "M8", tipologia: "Lote Tiny House", area: "115,91", precio: 13909, estado: "Disponible" },
  { id: "L070", nombre: "Lote 70", manzana: "M8", tipologia: "Lote Tiny House", area: "116,06", precio: 13927, estado: "Disponible" },
  { id: "L071", nombre: "Lote 71", manzana: "M8", tipologia: "Lote Tiny House", area: "116,22", precio: 13946, estado: "Disponible" },
  { id: "L072", nombre: "Lote 72", manzana: "M8", tipologia: "Lote Tiny House", area: "116,38", precio: 6983, estado: "En Oferta" },
  { id: "L073", nombre: "Lote 73", manzana: "M8", tipologia: "Lote Tiny House", area: "116,54", precio: 13985, estado: "Disponible" },
  { id: "L074", nombre: "Lote 74", manzana: "M8", tipologia: "Lote Tiny House", area: "116,69", precio: 14003, estado: "Disponible" },
  { id: "L075", nombre: "Lote 75", manzana: "M8", tipologia: "Lote Tiny House", area: "116,85", precio: 14022, estado: "Disponible" },
  { id: "L076", nombre: "Lote 76", manzana: "M8", tipologia: "Lote Tiny House", area: "117,01", precio: 14041, estado: "Disponible" },
  { id: "L077", nombre: "Lote 77", manzana: "M8", tipologia: "Lote Tiny House", area: "115,79", precio: 6947, estado: "En Oferta" },
  { id: "L078", nombre: "Lote 78", manzana: "M8", tipologia: "Lote Tiny House", area: "115,78", precio: 13894, estado: "Disponible" },
  { id: "L079", nombre: "Lote 79", manzana: "M8", tipologia: "Lote Tiny House", area: "115,94", precio: 13913, estado: "Disponible" },
  { id: "L080", nombre: "Lote 80", manzana: "M8", tipologia: "Lote Tiny House", area: "116,09", precio: 6965, estado: "En Oferta" },
  { id: "L081", nombre: "Lote 81", manzana: "M8", tipologia: "Lote Tiny House", area: "116,25", precio: 13950, estado: "Separado" },
  { id: "L082", nombre: "Lote 82", manzana: "M8", tipologia: "Lote Tiny House", area: "116,41", precio: 6985, estado: "En Oferta" },
  { id: "L083", nombre: "Lote 83", manzana: "M8", tipologia: "Lote Tiny House", area: "116,57", precio: 13988, estado: "Disponible" },
  { id: "L084", nombre: "Lote 84", manzana: "M8", tipologia: "Lote Tiny House", area: "116,72", precio: 14006, estado: "Disponible" },
  { id: "L085", nombre: "Lote 85", manzana: "M8", tipologia: "Lote Tiny House", area: "116,88", precio: 14026, estado: "Disponible" },
  { id: "L086", nombre: "Lote 86", manzana: "M8", tipologia: "Lote Tiny House", area: "117,03", precio: 14044, estado: "Disponible" },
  // M9
  { id: "L087", nombre: "Lote 87", manzana: "M9", tipologia: "Lote Tiny House", area: "121,33", precio: 14560, estado: "Disponible" },
  { id: "L088", nombre: "Lote 88", manzana: "M9", tipologia: "Lote Tiny House", area: "120,26", precio: 14431, estado: "Disponible" },
  { id: "L089", nombre: "Lote 89", manzana: "M9", tipologia: "Lote Tiny House", area: "119,58", precio: 14350, estado: "Disponible" },
  { id: "L090", nombre: "Lote 90", manzana: "M9", tipologia: "Lote Tiny House", area: "119,16", precio: 14299, estado: "Disponible" },
  { id: "L091", nombre: "Lote 91", manzana: "M9", tipologia: "Lote Tiny House", area: "119,20", precio: 14304, estado: "Disponible" },
  { id: "L092", nombre: "Lote 92", manzana: "M9", tipologia: "Lote Tiny House", area: "119,46", precio: 14335, estado: "Disponible" },
  { id: "L093", nombre: "Lote 93", manzana: "M9", tipologia: "Lote Tiny House", area: "120,07", precio: 14408, estado: "Disponible" },
  { id: "L094", nombre: "Lote 94", manzana: "M9", tipologia: "Lote Tiny House", area: "120,97", precio: 14516, estado: "Disponible" },
  { id: "L095", nombre: "Lote 95", manzana: "M9", tipologia: "Lote Tiny House", area: "122,11", precio: 14653, estado: "Disponible" },
  { id: "L096", nombre: "Lote 96", manzana: "M9", tipologia: "Lote Tiny House", area: "121,31", precio: 14557, estado: "Disponible" },
  { id: "L097", nombre: "Lote 97", manzana: "M9", tipologia: "Lote Tiny House", area: "120,19", precio: 14423, estado: "Disponible" },
  { id: "L098", nombre: "Lote 98", manzana: "M9", tipologia: "Lote Tiny House", area: "119,53", precio: 14344, estado: "Disponible" },
  { id: "L099", nombre: "Lote 99", manzana: "M9", tipologia: "Lote Tiny House", area: "119,16", precio: 14299, estado: "Vendido" },
  { id: "L100", nombre: "Lote 100", manzana: "M9", tipologia: "Lote Tiny House", area: "119,23", precio: 14308, estado: "Disponible" },
  { id: "L101", nombre: "Lote 101", manzana: "M9", tipologia: "Lote Tiny House", area: "119,53", precio: 14344, estado: "Disponible" },
  { id: "L102", nombre: "Lote 102", manzana: "M9", tipologia: "Lote Tiny House", area: "120,16", precio: 14419, estado: "Disponible" },
  { id: "L103", nombre: "Lote 103", manzana: "M9", tipologia: "Lote Tiny House", area: "121,08", precio: 14530, estado: "Disponible" },
  { id: "L104", nombre: "Lote 104", manzana: "M9", tipologia: "Lote Tiny House", area: "122,23", precio: 14668, estado: "Disponible" },
  // M10-M12 Tiny House
  { id: "L105", nombre: "Lote 105", manzana: "M10", tipologia: "Lote Tiny House", area: "224,59", precio: 26951, estado: "Disponible" },
  { id: "L106", nombre: "Lote 106", manzana: "M10", tipologia: "Lote Tiny House", area: "224,25", precio: 26910, estado: "Disponible" },
  { id: "L107", nombre: "Lote 107", manzana: "M10", tipologia: "Lote Tiny House", area: "224,50", precio: 26940, estado: "Disponible" },
  { id: "L108", nombre: "Lote 108", manzana: "M10", tipologia: "Lote Tiny House", area: "225,79", precio: 27095, estado: "Disponible" },
  { id: "L109", nombre: "Lote 109", manzana: "M10", tipologia: "Lote Tiny House", area: "227,19", precio: 27263, estado: "Disponible" },
  { id: "L110", nombre: "Lote 110", manzana: "M10", tipologia: "Lote Tiny House", area: "229,04", precio: 27485, estado: "Disponible" },
  { id: "L111", nombre: "Lote 111", manzana: "M10", tipologia: "Lote Tiny House", area: "231,24", precio: 27749, estado: "Disponible" },
  { id: "L112", nombre: "Lote 112", manzana: "M11", tipologia: "Lote Tiny House", area: "231,90", precio: 27828, estado: "Disponible" },
  { id: "L113", nombre: "Lote 113", manzana: "M11", tipologia: "Lote Tiny House", area: "231,69", precio: 27803, estado: "Disponible" },
  { id: "L114", nombre: "Lote 114", manzana: "M11", tipologia: "Lote Tiny House", area: "232,00", precio: 27840, estado: "Disponible" },
  { id: "L115", nombre: "Lote 115", manzana: "M11", tipologia: "Lote Tiny House", area: "232,32", precio: 27878, estado: "Disponible" },
  { id: "L116", nombre: "Lote 116", manzana: "M11", tipologia: "Lote Tiny House", area: "232,63", precio: 27916, estado: "Disponible" },
  { id: "L117", nombre: "Lote 117", manzana: "M11", tipologia: "Lote Tiny House", area: "232,95", precio: 27954, estado: "Disponible" },
  { id: "L118", nombre: "Lote 118", manzana: "M11", tipologia: "Lote Tiny House", area: "233,26", precio: 27991, estado: "Disponible" },
  { id: "L119", nombre: "Lote 119", manzana: "M11", tipologia: "Lote Tiny House", area: "233,58", precio: 28030, estado: "Disponible" },
  { id: "L120", nombre: "Lote 120", manzana: "M11", tipologia: "Lote Tiny House", area: "233,89", precio: 28067, estado: "Disponible" },
  { id: "L121", nombre: "Lote 121", manzana: "M11", tipologia: "Lote Tiny House", area: "234,20", precio: 28104, estado: "Disponible" },
  { id: "L122", nombre: "Lote 122", manzana: "M12", tipologia: "Lote Tiny House", area: "242,51", precio: 29101, estado: "Disponible" },
  { id: "L123", nombre: "Lote 123", manzana: "M12", tipologia: "Lote Tiny House", area: "240,04", precio: 28805, estado: "Disponible" },
  { id: "L124", nombre: "Lote 124", manzana: "M12", tipologia: "Lote Tiny House", area: "238,87", precio: 28664, estado: "Disponible" },
  { id: "L125", nombre: "Lote 125", manzana: "M12", tipologia: "Lote Tiny House", area: "238,29", precio: 28595, estado: "Disponible" },
  { id: "L126", nombre: "Lote 126", manzana: "M12", tipologia: "Lote Tiny House", area: "238,63", precio: 28636, estado: "Separado" },
  { id: "L127", nombre: "Lote 127", manzana: "M12", tipologia: "Lote Tiny House", area: "239,39", precio: 28727, estado: "Disponible" },
  { id: "L128", nombre: "Lote 128", manzana: "M12", tipologia: "Lote Tiny House", area: "240,78", precio: 28894, estado: "Disponible" },
  { id: "L129", nombre: "Lote 129", manzana: "M12", tipologia: "Lote Tiny House", area: "242,69", precio: 29123, estado: "Disponible" },
  { id: "L130", nombre: "Lote 130", manzana: "M12", tipologia: "Lote Tiny House", area: "245,02", precio: 29402, estado: "Disponible" },
  // M13-M18 Premium
  { id: "L131", nombre: "Lote 131", manzana: "M13", tipologia: "Lote Premium (Oasis)", area: "230,11", precio: 39119, estado: "Disponible" },
  { id: "L132", nombre: "Lote 132", manzana: "M13", tipologia: "Lote Premium (Oasis)", area: "229,44", precio: 39005, estado: "Disponible" },
  { id: "L133", nombre: "Lote 133", manzana: "M13", tipologia: "Lote Premium (Oasis)", area: "228,94", precio: 38920, estado: "Disponible" },
  { id: "L134", nombre: "Lote 134", manzana: "M13", tipologia: "Lote Premium (Oasis)", area: "229,10", precio: 38947, estado: "Disponible" },
  { id: "L135", nombre: "Lote 135", manzana: "M13", tipologia: "Lote Premium (Oasis)", area: "229,10", precio: 38947, estado: "Disponible" },
  { id: "L136", nombre: "Lote 136", manzana: "M13", tipologia: "Lote Premium (Oasis)", area: "229,42", precio: 39001, estado: "Disponible" },
  { id: "L137", nombre: "Lote 137", manzana: "M13", tipologia: "Lote Premium (Oasis)", area: "230,10", precio: 39117, estado: "Separado" },
  { id: "L138", nombre: "Lote 138", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "230,01", precio: 39102, estado: "Disponible" },
  { id: "L139", nombre: "Lote 139", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "232,13", precio: 39462, estado: "Disponible" },
  { id: "L140", nombre: "Lote 140", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "232,44", precio: 39515, estado: "Disponible" },
  { id: "L141", nombre: "Lote 141", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "232,75", precio: 39568, estado: "Disponible" },
  { id: "L142", nombre: "Lote 142", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "233,07", precio: 39622, estado: "Disponible" },
  { id: "L143", nombre: "Lote 143", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "233,39", precio: 39676, estado: "Disponible" },
  { id: "L144", nombre: "Lote 144", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "233,71", precio: 39731, estado: "Disponible" },
  { id: "L145", nombre: "Lote 145", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "234,02", precio: 39783, estado: "Disponible" },
  { id: "L146", nombre: "Lote 146", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "234,33", precio: 39836, estado: "Disponible" },
  { id: "L147", nombre: "Lote 147", manzana: "M14", tipologia: "Lote Premium (Oasis)", area: "234,64", precio: 39889, estado: "Disponible" },
  { id: "L148", nombre: "Lote 148", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "244,74", precio: 41606, estado: "Disponible" },
  { id: "L149", nombre: "Lote 149", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "244,53", precio: 41570, estado: "Disponible" },
  { id: "L150", nombre: "Lote 150", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "243,68", precio: 41426, estado: "Vendido" },
  { id: "L151", nombre: "Lote 151", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "242,92", precio: 41296, estado: "Disponible" },
  { id: "L152", nombre: "Lote 152", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "242,60", precio: 41242, estado: "Disponible" },
  { id: "L153", nombre: "Lote 153", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "242,25", precio: 41182, estado: "Separado" },
  { id: "L154", nombre: "Lote 154", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "242,20", precio: 41174, estado: "Disponible" },
  { id: "L155", nombre: "Lote 155", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "242,49", precio: 41223, estado: "Disponible" },
  { id: "L156", nombre: "Lote 156", manzana: "M15", tipologia: "Lote Premium (Oasis)", area: "243,17", precio: 41339, estado: "Disponible" },
  { id: "L157", nombre: "Lote 157", manzana: "M16", tipologia: "Lote Premium (Oasis)", area: "229,97", precio: 39095, estado: "Disponible" },
  { id: "L158", nombre: "Lote 158", manzana: "M16", tipologia: "Lote Premium (Oasis)", area: "229,39", precio: 38996, estado: "Disponible" },
  { id: "L159", nombre: "Lote 159", manzana: "M16", tipologia: "Lote Premium (Oasis)", area: "229,03", precio: 38935, estado: "Disponible" },
  { id: "L160", nombre: "Lote 160", manzana: "M16", tipologia: "Lote Premium (Oasis)", area: "229,40", precio: 38998, estado: "Disponible" },
  { id: "L161", nombre: "Lote 161", manzana: "M16", tipologia: "Lote Premium (Oasis)", area: "229,63", precio: 39037, estado: "Disponible" },
  { id: "L162", nombre: "Lote 162", manzana: "M16", tipologia: "Lote Premium (Oasis)", area: "230,19", precio: 39132, estado: "Disponible" },
  { id: "L163", nombre: "Lote 163", manzana: "M16", tipologia: "Lote Premium (Oasis)", area: "231,06", precio: 39280, estado: "Disponible" },
  { id: "L164", nombre: "Lote 164", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "230,91", precio: 39255, estado: "Disponible" },
  { id: "L165", nombre: "Lote 165", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "232,43", precio: 39513, estado: "Disponible" },
  { id: "L166", nombre: "Lote 166", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "232,74", precio: 39566, estado: "Disponible" },
  { id: "L167", nombre: "Lote 167", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "233,05", precio: 39618, estado: "Disponible" },
  { id: "L168", nombre: "Lote 168", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "233,36", precio: 39671, estado: "Disponible" },
  { id: "L169", nombre: "Lote 169", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "233,69", precio: 39727, estado: "Disponible" },
  { id: "L170", nombre: "Lote 170", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "234,00", precio: 39780, estado: "Disponible" },
  { id: "L171", nombre: "Lote 171", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "234,32", precio: 39834, estado: "Disponible" },
  { id: "L172", nombre: "Lote 172", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "234,63", precio: 39887, estado: "Disponible" },
  { id: "L173", nombre: "Lote 173", manzana: "M17", tipologia: "Lote Premium (Oasis)", area: "234,94", precio: 39940, estado: "Disponible" },
  { id: "L174", nombre: "Lote 174", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "244,83", precio: 41621, estado: "Disponible" },
  { id: "L175", nombre: "Lote 175", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "244,47", precio: 41560, estado: "Disponible" },
  { id: "L176", nombre: "Lote 176", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "243,65", precio: 41420, estado: "Disponible" },
  { id: "L177", nombre: "Lote 177", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "242,98", precio: 41307, estado: "Disponible" },
  { id: "L178", nombre: "Lote 178", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "242,79", precio: 41274, estado: "Disponible" },
  { id: "L179", nombre: "Lote 179", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "242,64", precio: 41249, estado: "Disponible" },
  { id: "L180", nombre: "Lote 180", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "242,83", precio: 41281, estado: "Disponible" },
  { id: "L181", nombre: "Lote 181", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "243,38", precio: 41375, estado: "Disponible" },
  { id: "L182", nombre: "Lote 182", manzana: "M18", tipologia: "Lote Premium (Oasis)", area: "244,28", precio: 41528, estado: "Disponible" },
  // M19 Estándar
  { id: "L183", nombre: "Lote 183", manzana: "M19", tipologia: "Lote Estándar", area: "229,90", precio: 27588, estado: "Disponible" },
  { id: "L184", nombre: "Lote 184", manzana: "M19", tipologia: "Lote Estándar", area: "229,38", precio: 27526, estado: "Disponible" },
  { id: "L185", nombre: "Lote 185", manzana: "M19", tipologia: "Lote Estándar", area: "229,10", precio: 27492, estado: "Disponible" },
  { id: "L186", nombre: "Lote 186", manzana: "M19", tipologia: "Lote Estándar", area: "229,56", precio: 27547, estado: "Disponible" },
  { id: "L187", nombre: "Lote 187", manzana: "M19", tipologia: "Lote Estándar", area: "229,90", precio: 27588, estado: "Disponible" },
  { id: "L188", nombre: "Lote 188", manzana: "M19", tipologia: "Lote Estándar", area: "230,56", precio: 27667, estado: "Disponible" },
  { id: "L189", nombre: "Lote 189", manzana: "M19", tipologia: "Lote Estándar", area: "231,52", precio: 27782, estado: "Disponible" },
  // M20 Zen
  { id: "L190", nombre: "Lote 190", manzana: "M20", tipologia: "Lote Zen", area: "231,34", precio: 27761, estado: "Disponible" },
  { id: "L191", nombre: "Lote 191", manzana: "M20", tipologia: "Lote Zen", area: "232,59", precio: 27911, estado: "Disponible" },
  { id: "L192", nombre: "Lote 192", manzana: "M20", tipologia: "Lote Zen", area: "232,90", precio: 27948, estado: "Disponible" },
  { id: "L193", nombre: "Lote 193", manzana: "M20", tipologia: "Lote Zen", area: "233,21", precio: 27985, estado: "Disponible" },
  { id: "L194", nombre: "Lote 194", manzana: "M20", tipologia: "Lote Zen", area: "233,52", precio: 28022, estado: "Disponible" },
  { id: "L195", nombre: "Lote 195", manzana: "M20", tipologia: "Lote Zen", area: "233,85", precio: 28062, estado: "Disponible" },
  { id: "L196", nombre: "Lote 196", manzana: "M20", tipologia: "Lote Zen", area: "234,16", precio: 28099, estado: "Disponible" },
  { id: "L197", nombre: "Lote 197", manzana: "M20", tipologia: "Lote Zen", area: "234,47", precio: 28136, estado: "Disponible" },
  { id: "L198", nombre: "Lote 198", manzana: "M20", tipologia: "Lote Zen", area: "234,78", precio: 28174, estado: "Disponible" },
  { id: "L199", nombre: "Lote 199", manzana: "M20", tipologia: "Lote Zen", area: "235,10", precio: 28212, estado: "Disponible" },
  // M21 Estándar
  { id: "L200", nombre: "Lote 200", manzana: "M21", tipologia: "Lote Estándar", area: "244,88", precio: 29386, estado: "Disponible" },
  { id: "L201", nombre: "Lote 201", manzana: "M21", tipologia: "Lote Estándar", area: "244,44", precio: 29333, estado: "Disponible" },
  { id: "L202", nombre: "Lote 202", manzana: "M21", tipologia: "Lote Estándar", area: "243,65", precio: 29238, estado: "Disponible" },
  { id: "L203", nombre: "Lote 203", manzana: "M21", tipologia: "Lote Estándar", area: "243,02", precio: 29162, estado: "Disponible" },
  { id: "L204", nombre: "Lote 204", manzana: "M21", tipologia: "Lote Estándar", area: "242,91", precio: 29149, estado: "Disponible" },
  { id: "L205", nombre: "Lote 205", manzana: "M21", tipologia: "Lote Estándar", area: "242,86", precio: 29143, estado: "Disponible" },
  { id: "L206", nombre: "Lote 206", manzana: "M21", tipologia: "Lote Estándar", area: "243,16", precio: 29179, estado: "Disponible" },
  { id: "L207", nombre: "Lote 207", manzana: "M21", tipologia: "Lote Estándar", area: "243,82", precio: 29258, estado: "Disponible" },
  { id: "L208", nombre: "Lote 208", manzana: "M21", tipologia: "Lote Estándar", area: "244,82", precio: 29378, estado: "Disponible" },
  // M22-M24 Tiny House
  { id: "L209", nombre: "Lote 209", manzana: "M22", tipologia: "Lote Tiny House", area: "114,93", precio: 13792, estado: "Disponible" },
  { id: "L210", nombre: "Lote 210", manzana: "M22", tipologia: "Lote Tiny House", area: "114,69", precio: 13763, estado: "Disponible" },
  { id: "L211", nombre: "Lote 211", manzana: "M22", tipologia: "Lote Tiny House", area: "114,58", precio: 13750, estado: "Disponible" },
  { id: "L212", nombre: "Lote 212", manzana: "M22", tipologia: "Lote Tiny House", area: "114,85", precio: 13782, estado: "Disponible" },
  { id: "L213", nombre: "Lote 213", manzana: "M22", tipologia: "Lote Tiny House", area: "115,06", precio: 13807, estado: "Disponible" },
  { id: "L214", nombre: "Lote 214", manzana: "M22", tipologia: "Lote Tiny House", area: "115,43", precio: 13852, estado: "Disponible" },
  { id: "L215", nombre: "Lote 215", manzana: "M22", tipologia: "Lote Tiny House", area: "115,95", precio: 13914, estado: "Disponible" },
  { id: "L216", nombre: "Lote 216", manzana: "M22", tipologia: "Lote Tiny House", area: "114,92", precio: 13790, estado: "Disponible" },
  { id: "L217", nombre: "Lote 217", manzana: "M22", tipologia: "Lote Tiny House", area: "114,69", precio: 13763, estado: "Disponible" },
  { id: "L218", nombre: "Lote 218", manzana: "M22", tipologia: "Lote Tiny House", area: "114,60", precio: 13752, estado: "Disponible" },
  { id: "L219", nombre: "Lote 219", manzana: "M22", tipologia: "Lote Tiny House", area: "114,88", precio: 13786, estado: "Disponible" },
  { id: "L220", nombre: "Lote 220", manzana: "M22", tipologia: "Lote Tiny House", area: "115,11", precio: 13813, estado: "Disponible" },
  { id: "L221", nombre: "Lote 221", manzana: "M22", tipologia: "Lote Tiny House", area: "115,50", precio: 13860, estado: "Disponible" },
  { id: "L222", nombre: "Lote 222", manzana: "M22", tipologia: "Lote Tiny House", area: "116,02", precio: 13922, estado: "Disponible" },
  { id: "L223", nombre: "Lote 223", manzana: "M23", tipologia: "Lote Tiny House", area: "115,84", precio: 13901, estado: "Disponible" },
  { id: "L224", nombre: "Lote 224", manzana: "M23", tipologia: "Lote Tiny House", area: "116,36", precio: 13963, estado: "Disponible" },
  { id: "L225", nombre: "Lote 225", manzana: "M23", tipologia: "Lote Tiny House", area: "116,51", precio: 13981, estado: "Disponible" },
  { id: "L226", nombre: "Lote 226", manzana: "M23", tipologia: "Lote Tiny House", area: "116,67", precio: 14000, estado: "Disponible" },
  { id: "L227", nombre: "Lote 227", manzana: "M23", tipologia: "Lote Tiny House", area: "116,83", precio: 14020, estado: "Disponible" },
  { id: "L228", nombre: "Lote 228", manzana: "M23", tipologia: "Lote Tiny House", area: "116,99", precio: 14039, estado: "Disponible" },
  { id: "L229", nombre: "Lote 229", manzana: "M23", tipologia: "Lote Tiny House", area: "117,15", precio: 14058, estado: "Separado" },
  { id: "L230", nombre: "Lote 230", manzana: "M23", tipologia: "Lote Tiny House", area: "117,30", precio: 14076, estado: "Disponible" },
  { id: "L231", nombre: "Lote 231", manzana: "M23", tipologia: "Lote Tiny House", area: "117,46", precio: 14095, estado: "Disponible" },
  { id: "L232", nombre: "Lote 232", manzana: "M23", tipologia: "Lote Tiny House", area: "117,61", precio: 14113, estado: "Disponible" },
  { id: "L233", nombre: "Lote 233", manzana: "M23", tipologia: "Lote Tiny House", area: "115,91", precio: 13909, estado: "Disponible" },
  { id: "L234", nombre: "Lote 234", manzana: "M23", tipologia: "Lote Tiny House", area: "116,39", precio: 13967, estado: "Disponible" },
  { id: "L235", nombre: "Lote 235", manzana: "M23", tipologia: "Lote Tiny House", area: "116,54", precio: 13985, estado: "Disponible" },
  { id: "L236", nombre: "Lote 236", manzana: "M23", tipologia: "Lote Tiny House", area: "116,70", precio: 14004, estado: "Disponible" },
  { id: "L237", nombre: "Lote 237", manzana: "M23", tipologia: "Lote Tiny House", area: "116,85", precio: 14022, estado: "Disponible" },
  { id: "L238", nombre: "Lote 238", manzana: "M23", tipologia: "Lote Tiny House", area: "117,02", precio: 14042, estado: "Disponible" },
  { id: "L239", nombre: "Lote 239", manzana: "M23", tipologia: "Lote Tiny House", area: "117,17", precio: 14060, estado: "Disponible" },
  { id: "L240", nombre: "Lote 240", manzana: "M23", tipologia: "Lote Tiny House", area: "117,33", precio: 14080, estado: "Disponible" },
  { id: "L241", nombre: "Lote 241", manzana: "M23", tipologia: "Lote Tiny House", area: "117,49", precio: 14099, estado: "Disponible" },
  { id: "L242", nombre: "Lote 242", manzana: "M23", tipologia: "Lote Tiny House", area: "117,64", precio: 14117, estado: "Disponible" },
  { id: "L243", nombre: "Lote 243", manzana: "M24", tipologia: "Lote Tiny House", area: "122,46", precio: 14695, estado: "Disponible" },
  { id: "L244", nombre: "Lote 244", manzana: "M24", tipologia: "Lote Tiny House", area: "122,21", precio: 14665, estado: "Disponible" },
  { id: "L245", nombre: "Lote 245", manzana: "M24", tipologia: "Lote Tiny House", area: "121,82", precio: 14618, estado: "Disponible" },
  { id: "L246", nombre: "Lote 246", manzana: "M24", tipologia: "Lote Tiny House", area: "121,53", precio: 14584, estado: "Disponible" },
  { id: "L247", nombre: "Lote 247", manzana: "M24", tipologia: "Lote Tiny House", area: "121,50", precio: 14580, estado: "Disponible" },
  { id: "L248", nombre: "Lote 248", manzana: "M24", tipologia: "Lote Tiny House", area: "121,52", precio: 14582, estado: "Disponible" },
  { id: "L249", nombre: "Lote 249", manzana: "M24", tipologia: "Lote Tiny House", area: "121,71", precio: 14605, estado: "Disponible" },
  { id: "L250", nombre: "Lote 250", manzana: "M24", tipologia: "Lote Tiny House", area: "122,09", precio: 14651, estado: "Disponible" },
  { id: "L251", nombre: "Lote 251", manzana: "M24", tipologia: "Lote Tiny House", area: "122,62", precio: 14714, estado: "Disponible" },
  { id: "L252", nombre: "Lote 252", manzana: "M24", tipologia: "Lote Tiny House", area: "122,47", precio: 14696, estado: "Disponible" },
  { id: "L253", nombre: "Lote 253", manzana: "M24", tipologia: "Lote Tiny House", area: "122,20", precio: 14664, estado: "Disponible" },
  { id: "L254", nombre: "Lote 254", manzana: "M24", tipologia: "Lote Tiny House", area: "121,82", precio: 14618, estado: "Disponible" },
  { id: "L255", nombre: "Lote 255", manzana: "M24", tipologia: "Lote Tiny House", area: "121,54", precio: 14585, estado: "Disponible" },
  { id: "L256", nombre: "Lote 256", manzana: "M24", tipologia: "Lote Tiny House", area: "121,53", precio: 14584, estado: "Disponible" },
  { id: "L257", nombre: "Lote 257", manzana: "M24", tipologia: "Lote Tiny House", area: "121,56", precio: 14587, estado: "Disponible" },
  { id: "L258", nombre: "Lote 258", manzana: "M24", tipologia: "Lote Tiny House", area: "121,77", precio: 14612, estado: "Disponible" },
  { id: "L259", nombre: "Lote 259", manzana: "M24", tipologia: "Lote Tiny House", area: "122,16", precio: 14659, estado: "Disponible" },
  { id: "L260", nombre: "Lote 260", manzana: "M24", tipologia: "Lote Tiny House", area: "122,71", precio: 14725, estado: "Disponible" },
  // M25-M27 Estándar
  { id: "L261", nombre: "Lote 261", manzana: "M25", tipologia: "Lote Estándar", area: "158,48", precio: 19018, estado: "Disponible" },
  { id: "L262", nombre: "Lote 262", manzana: "M25", tipologia: "Lote Estándar", area: "158,20", precio: 18984, estado: "Disponible" },
  { id: "L263", nombre: "Lote 263", manzana: "M25", tipologia: "Lote Estándar", area: "158,11", precio: 18973, estado: "Disponible" },
  { id: "L264", nombre: "Lote 264", manzana: "M25", tipologia: "Lote Estándar", area: "158,54", precio: 19025, estado: "Disponible" },
  { id: "L265", nombre: "Lote 265", manzana: "M25", tipologia: "Lote Estándar", area: "158,90", precio: 19068, estado: "Disponible" },
  { id: "L266", nombre: "Lote 266", manzana: "M25", tipologia: "Lote Estándar", area: "159,48", precio: 19138, estado: "Disponible" },
  { id: "L267", nombre: "Lote 267", manzana: "M25", tipologia: "Lote Estándar", area: "160,24", precio: 19229, estado: "Disponible" },
  { id: "L268", nombre: "Lote 268", manzana: "M26", tipologia: "Lote Estándar", area: "160,06", precio: 19207, estado: "Disponible" },
  { id: "L269", nombre: "Lote 269", manzana: "M26", tipologia: "Lote Estándar", area: "160,61", precio: 19273, estado: "Disponible" },
  { id: "L270", nombre: "Lote 270", manzana: "M26", tipologia: "Lote Estándar", area: "160,83", precio: 19300, estado: "Disponible" },
  { id: "L271", nombre: "Lote 271", manzana: "M26", tipologia: "Lote Estándar", area: "161,04", precio: 19325, estado: "Disponible" },
  { id: "L272", nombre: "Lote 272", manzana: "M26", tipologia: "Lote Estándar", area: "161,26", precio: 19351, estado: "Disponible" },
  { id: "L273", nombre: "Lote 273", manzana: "M26", tipologia: "Lote Estándar", area: "161,48", precio: 19378, estado: "Disponible" },
  { id: "L274", nombre: "Lote 274", manzana: "M26", tipologia: "Lote Estándar", area: "161,70", precio: 19404, estado: "Disponible" },
  { id: "L275", nombre: "Lote 275", manzana: "M26", tipologia: "Lote Estándar", area: "161,91", precio: 19429, estado: "Disponible" },
  { id: "L276", nombre: "Lote 276", manzana: "M26", tipologia: "Lote Estándar", area: "162,13", precio: 19456, estado: "Disponible" },
  { id: "L277", nombre: "Lote 277", manzana: "M26", tipologia: "Lote Estándar", area: "162,35", precio: 19482, estado: "Disponible" },
  { id: "L278", nombre: "Lote 278", manzana: "M27", tipologia: "Lote Estándar", area: "168,95", precio: 20274, estado: "Disponible" },
  { id: "L279", nombre: "Lote 279", manzana: "M27", tipologia: "Lote Estándar", area: "168,54", precio: 20225, estado: "Disponible" },
  { id: "L280", nombre: "Lote 280", manzana: "M27", tipologia: "Lote Estándar", area: "168,04", precio: 20165, estado: "Disponible" },
  { id: "L281", nombre: "Lote 281", manzana: "M27", tipologia: "Lote Estándar", area: "167,67", precio: 20120, estado: "Disponible" },
  { id: "L282", nombre: "Lote 282", manzana: "M27", tipologia: "Lote Estándar", area: "167,69", precio: 20123, estado: "Disponible" },
  { id: "L283", nombre: "Lote 283", manzana: "M27", tipologia: "Lote Estándar", area: "167,78", precio: 20134, estado: "Disponible" },
  { id: "L284", nombre: "Lote 284", manzana: "M27", tipologia: "Lote Estándar", area: "168,12", precio: 20174, estado: "Disponible" },
  { id: "L285", nombre: "Lote 285", manzana: "M27", tipologia: "Lote Estándar", area: "168,70", precio: 20244, estado: "Disponible" },
  { id: "L286", nombre: "Lote 286", manzana: "M27", tipologia: "Lote Estándar", area: "169,50", precio: 20340, estado: "Disponible" },
  // M28-M30 Irregular
  { id: "L287", nombre: "Lote 287", manzana: "M28", tipologia: "Lote Ajuste (Irregular)", area: "229,76", precio: 27571, estado: "Disponible" },
  { id: "L288", nombre: "Lote 288", manzana: "M28", tipologia: "Lote Ajuste (Irregular)", area: "229,41", precio: 27529, estado: "Disponible" },
  { id: "L289", nombre: "Lote 289", manzana: "M28", tipologia: "Lote Ajuste (Irregular)", area: "229,34", precio: 27521, estado: "Disponible" },
  { id: "L290", nombre: "Lote 290", manzana: "M28", tipologia: "Lote Ajuste (Irregular)", area: "230,05", precio: 27606, estado: "Disponible" },
  { id: "L291", nombre: "Lote 291", manzana: "M28", tipologia: "Lote Ajuste (Irregular)", area: "230,65", precio: 27678, estado: "Disponible" },
  { id: "L292", nombre: "Lote 292", manzana: "M28", tipologia: "Lote Ajuste (Irregular)", area: "231,55", precio: 27786, estado: "Separado" },
  { id: "L293", nombre: "Lote 293", manzana: "M28", tipologia: "Lote Ajuste (Irregular)", area: "232,70", precio: 27924, estado: "Disponible" },
  { id: "L294", nombre: "Lote 294", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "232,41", precio: 27889, estado: "Disponible" },
  { id: "L295", nombre: "Lote 295", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "233,04", precio: 27965, estado: "Disponible" },
  { id: "L296", nombre: "Lote 296", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "233,35", precio: 28002, estado: "Disponible" },
  { id: "L297", nombre: "Lote 297", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "233,66", precio: 28039, estado: "Disponible" },
  { id: "L298", nombre: "Lote 298", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "233,97", precio: 28076, estado: "Disponible" },
  { id: "L299", nombre: "Lote 299", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "234,30", precio: 28116, estado: "Disponible" },
  { id: "L300", nombre: "Lote 300", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "234,61", precio: 28153, estado: "Disponible" },
  { id: "L301", nombre: "Lote 301", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "234,92", precio: 28190, estado: "Disponible" },
  { id: "L302", nombre: "Lote 302", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "235,23", precio: 28228, estado: "Disponible" },
  { id: "L303", nombre: "Lote 303", manzana: "M29", tipologia: "Lote Ajuste (Irregular)", area: "235,55", precio: 28266, estado: "Disponible" },
  { id: "L304", nombre: "Lote 304", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "245,03", precio: 29404, estado: "Disponible" },
  { id: "L305", nombre: "Lote 305", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "244,36", precio: 29323, estado: "Disponible" },
  { id: "L306", nombre: "Lote 306", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "243,66", precio: 29239, estado: "Disponible" },
  { id: "L307", nombre: "Lote 307", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "243,19", precio: 29183, estado: "Disponible" },
  { id: "L308", nombre: "Lote 308", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "243,28", precio: 29194, estado: "Disponible" },
  { id: "L309", nombre: "Lote 309", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "243,49", precio: 29219, estado: "Disponible" },
  { id: "L310", nombre: "Lote 310", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "244,06", precio: 29287, estado: "Disponible" },
  { id: "L311", nombre: "Lote 311", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "244,98", precio: 29398, estado: "Disponible" },
  { id: "L312", nombre: "Lote 312", manzana: "M30", tipologia: "Lote Ajuste (Irregular)", area: "246,20", precio: 29544, estado: "Disponible" },
  // PARKING
  ...Array.from({ length: 138 }, (_, i) => ({
    id: `P${String(i + 1).padStart(3, '0')}`,
    nombre: `P${i + 1}`,
    manzana: "PARKING",
    tipologia: "Cochera Plus",
    area: "12,50",
    precio: 5000,
    estado: "Disponible",
  })),
];

// ================================================================
// PARACAS DOME DATA
// ================================================================
const DOME_DATA: DomeLot[] = [];
// Fila 1 (Premium)
for (let i = 1; i <= 11; i++) {
  DOME_DATA.push({
    id: `D-${i}`,
    nombre: `Domo ${i}`,
    fila: "Fila 1",
    tipologia: "Premium",
    areaM2: 2000,
    domoM2: 50,
    precioFounder: 70000,
    precioComfort: 89000,
    costoTerreno: 10000,
    inversionMaxDomo: 35000,
    gananciaMinFounder: 25000,
    gananciaMinComfort: 44000,
    estado: i === 3 || i === 7 ? "Separado" : i === 5 ? "Vendido" : "Disponible"
  });
}
// Fila 2 (Estándar)
for (let i = 12; i <= 22; i++) {
  DOME_DATA.push({
    id: `D-${i}`,
    nombre: `Domo ${i}`,
    fila: "Fila 2",
    tipologia: "Estándar",
    areaM2: 2000,
    domoM2: 50,
    precioFounder: 70000,
    precioComfort: 89000,
    costoTerreno: 10000,
    inversionMaxDomo: 35000,
    gananciaMinFounder: 25000,
    gananciaMinComfort: 44000,
    estado: i === 15 ? "Vendido" : i === 18 ? "Separado" : "Disponible"
  });
}
// Fila 3 (Estándar)
for (let i = 23; i <= 28; i++) {
  DOME_DATA.push({
    id: `D-${i}`,
    nombre: `Domo ${i}`,
    fila: "Fila 3",
    tipologia: "Estándar",
    areaM2: 2000,
    domoM2: 50,
    precioFounder: 70000,
    precioComfort: 89000,
    costoTerreno: 10000,
    inversionMaxDomo: 35000,
    gananciaMinFounder: 25000,
    gananciaMinComfort: 44000,
    estado: "Disponible"
  });
}
// Fila 4 (Estándar)
for (let i = 29; i <= 39; i++) {
  DOME_DATA.push({
    id: `D-${i}`,
    nombre: `Domo ${i}`,
    fila: "Fila 4",
    tipologia: "Estándar",
    areaM2: 2000,
    domoM2: 50,
    precioFounder: 70000,
    precioComfort: 89000,
    costoTerreno: 10000,
    inversionMaxDomo: 35000,
    gananciaMinFounder: 25000,
    gananciaMinComfort: 44000,
    estado: i === 32 ? "Separado" : i === 36 ? "Vendido" : "Disponible"
  });
}
// Fila 5 (Premium)
for (let i = 40; i <= 50; i++) {
  DOME_DATA.push({
    id: `D-${i}`,
    nombre: `Domo ${i}`,
    fila: "Fila 5",
    tipologia: "Premium",
    areaM2: 2000,
    domoM2: 50,
    precioFounder: 70000,
    precioComfort: 89000,
    costoTerreno: 10000,
    inversionMaxDomo: 35000,
    gananciaMinFounder: 25000,
    gananciaMinComfort: 44000,
    estado: i === 42 ? "Vendido" : i === 48 ? "Separado" : "Disponible"
  });
}

// ================================================================
// CONSTANTS & HELPERS
// ================================================================
const fmt = (v: number) => `S/ ${v.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const moonEstadoColor: Record<string, string> = {
  "Disponible": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "Vendido": "bg-rose-500/10 text-rose-400 border-rose-500/30",
  "Separado": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "En Oferta": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  "Bloqueado": "bg-stone-500/10 text-stone-400 border-stone-500/30",
};

export const Comisiones: React.FC = () => {
  // Authentication State
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("comisiones_auth") === "true";
  });
  const [authError, setAuthError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "102610") {
      setIsAuthenticated(true);
      setAuthError("");
      localStorage.setItem("comisiones_auth", "true");
    } else {
      setAuthError("Contraseña incorrecta. Intente nuevamente.");
    }
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<"moon" | "dome">("moon");

  // Editable commission rates
  const [pctGerente, setPctGerente] = useState(1.5);
  const [pctVendedor, setPctVendedor] = useState(5.0);
  const [pctBonoMeta, setPctBonoMeta] = useState(2.5);
  const [pctBonoSemestral, setPctBonoSemestral] = useState(1.0);
  const totalPct = pctGerente + pctVendedor + pctBonoMeta + pctBonoSemestral;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#100C0A] py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full space-y-8 bg-[#1D1714] border border-[#E1D9C1]/15 p-8 rounded-3xl shadow-2xl relative">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-[#E2725B]/10 border border-[#E2725B]/30 rounded-full flex items-center justify-center text-[#E2725B]">
              <Calculator className="w-6 h-6" />
            </div>
            <h2 className="mt-6 text-center text-2xl font-display font-bold text-white tracking-widest uppercase">
              Área Reservada
            </h2>
            <p className="mt-2 text-center text-xs text-[#E1D9C1]/60 uppercase tracking-wider">
              Módulo Interno de Comisiones
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label className="sr-only">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-2xl relative block w-full px-4 py-3 bg-[#100C0A] border border-[#E1D9C1]/15 text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-[#E2725B] focus:border-[#E2725B] text-center text-sm font-bold tracking-widest"
                  placeholder="••••••"
                />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-[#E2725B] text-center font-bold tracking-wide uppercase">
                {authError}
              </p>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 border border-[#E2725B]/40 text-xs font-bold uppercase tracking-widest text-white bg-[#E2725B] hover:bg-[#d85e45] rounded-xl transition-all shadow-[0_0_15px_rgba(226,114,91,0.25)] active:translate-y-0.5"
              >
                Ingresar
              </button>
              
              <a
                href="/"
                className="text-center text-[10px] text-[#E1D9C1]/40 hover:text-[#E1D9C1]/80 font-bold uppercase tracking-widest pt-2 transition-colors"
              >
                Volver al Proyecto
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Selected row details modal/drawer state
  const [selectedLotDetail, setSelectedLotDetail] = useState<LotData | null>(null);
  const [selectedDomeDetail, setSelectedDomeDetail] = useState<DomeLot | null>(null);

  // Scenario simulator state
  const [simQuantity, setSimQuantity] = useState(2);
  const [simProduct, setSimProduct] = useState<"standard" | "tiny" | "premium" | "dome_founder" | "dome_comfort">("standard");

  // Reservation dialog / modal state
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [targetLotId, setTargetLotId] = useState<string>("");
  const [targetProyecto, setTargetProyecto] = useState<"Moon Paracas" | "Paracas Dome">("Moon Paracas");
  const [clientName, setClientName] = useState("");
  const [reservationAmount, setReservationAmount] = useState(1000);

  // Real-time collections loaded from Firebase Firestore
  const [moonData, setMoonData] = useState<LotData[]>(MOON_RAW_DATA);
  const [domeData, setDomeData] = useState<DomeLot[]>(DOME_DATA);
  const [reservationsLog, setReservationsLog] = useState<SeparationRecord[]>([]);

  // Connect state to Firebase Firestore collections in real time
  useEffect(() => {
    // 1. Sync Moon Paracas Lots
    const unsubscribeMoon = onSnapshot(collection(db, "lots"), (snapshot) => {
      if (!snapshot.empty) {
        const dbLots = snapshot.docs.map(doc => doc.data());
        setMoonData(prev => prev.map(lot => {
          const match = dbLots.find(l => l.id === lot.id);
          if (match) {
            let estado = "Disponible";
            if (match.status === "sold") estado = "Vendido";
            else if (match.status === "reserved") estado = "Separado";
            else if (match.status === "offer") estado = "En Oferta";
            else if (match.status === "blocked") estado = "Bloqueado";
            return { ...lot, estado };
          }
          return lot;
        }));
      }
    });

    // 2. Sync Paracas Dome Lots
    const unsubscribeDome = onSnapshot(collection(db, "dome_lots"), (snapshot) => {
      if (!snapshot.empty) {
        const dbLots = snapshot.docs.map(doc => doc.data());
        setDomeData(prev => prev.map(lot => {
          const match = dbLots.find(l => l.id === lot.id);
          if (match) {
            let estado = "Disponible";
            if (match.status === "sold") estado = "Vendido";
            else if (match.status === "reserved") estado = "Separado";
            else if (match.status === "offer") estado = "En Oferta";
            else if (match.status === "blocked") estado = "Bloqueado";
            return { ...lot, estado };
          }
          return lot;
        }));
      }
    });

    // 3. Sync Reservations Log
    const unsubscribeReservations = onSnapshot(collection(db, "reservations"), (snapshot) => {
      const records: SeparationRecord[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          lotId: data.lotId,
          proyecto: data.lotId.startsWith("D-") ? "Paracas Dome" : "Moon Paracas",
          clienteName: data.clientName || "Cliente Web",
          montoSeparacion: data.monthlyAmount || 1000,
          fecha: data.createdAt ? new Date(data.createdAt).toLocaleString("es-PE") : "N/A",
          originalEstado: "Disponible"
        };
      });
      // Sort reservations by date descending
      records.sort((a, b) => b.fecha.localeCompare(a.fecha));
      setReservationsLog(records);
    });

    return () => {
      unsubscribeMoon();
      unsubscribeDome();
      unsubscribeReservations();
    };
  }, []);

  // Open reservation modal
  const handleOpenReserveModal = (lotId: string, proyecto: "Moon Paracas" | "Paracas Dome", e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail modal
    setTargetLotId(lotId);
    setTargetProyecto(proyecto);
    setClientName("");
    setReservationAmount(1000);
    setReserveModalOpen(true);
  };

  // Submit separation to Firestore
  const handleConfirmReservation = async () => {
    if (!clientName.trim()) {
      alert("Por favor ingrese el nombre del cliente o asesor.");
      return;
    }

    try {
      // 1. Add reservation entry in Firestore reservations collection
      await addDoc(collection(db, "reservations"), {
        lotId: targetLotId,
        clientName: clientName,
        clientDni: "",
        clientEmail: "",
        clientPhone: "",
        monthlyAmount: reservationAmount,
        installmentsCount: 1,
        isCash: true,
        status: "paid",
        createdAt: new Date().toISOString()
      });

      // 2. Set status to reserved in corresponding Firestore lot collection
      const isDome = targetProyecto === "Paracas Dome";
      const lotRef = doc(db, isDome ? "dome_lots" : "lots", targetLotId);
      await updateDoc(lotRef, { status: "reserved" });

      setReserveModalOpen(false);
      setSelectedLotDetail(null);
      setSelectedDomeDetail(null);
    } catch (err: any) {
      console.error("Error creating reservation in Firestore:", err);
      alert(`Error al registrar separación en base de datos central: ${err.message || err}`);
    }
  };

  // Release / Cancel reservation in Firestore
  const handleReleaseReservation = async (record: SeparationRecord) => {
    if (window.confirm(`¿Está seguro de que desea liberar esta separación y retornar el lote ${record.lotId} a Disponible?`)) {
      try {
        const isDome = record.proyecto === "Paracas Dome";
        const lotRef = doc(db, isDome ? "dome_lots" : "lots", record.lotId);
        await updateDoc(lotRef, { status: "available" });

        const resRef = doc(db, "reservations", record.id);
        await deleteDoc(resRef);
      } catch (err: any) {
        console.error("Error releasing reservation in Firestore:", err);
        alert(`Error al liberar separación en base de datos central: ${err.message || err}`);
      }
    }
  };

  // Clear all separations log in Firestore
  const handleClearAllSeparations = async () => {
    if (window.confirm("🔴 ADVERTENCIA: Esto liberará absolutamente todas las separaciones registradas en la base de datos central. ¿Desea continuar?")) {
      try {
        for (const record of reservationsLog) {
          const isDome = record.proyecto === "Paracas Dome";
          const lotRef = doc(db, isDome ? "dome_lots" : "lots", record.lotId);
          await updateDoc(lotRef, { status: "available" });
          
          const resRef = doc(db, "reservations", record.id);
          await deleteDoc(resRef);
        }
      } catch (err: any) {
        console.error("Error clearing reservations in Firestore:", err);
        alert(`Error al vaciar separaciones: ${err.message || err}`);
      }
    }
  };

  // Reset to values
  const resetRates = () => {
    setPctGerente(1.5);
    setPctVendedor(5.0);
    setPctBonoMeta(2.5);
    setPctBonoSemestral(1.0);
  };

  // Simulated Earnings
  const simulatedEarnings = useMemo(() => {
    let unitPrice = 0;
    let name = "";
    switch (simProduct) {
      case "standard": unitPrice = 27000; name = "Lote Estándar (Moon)"; break;
      case "tiny": unitPrice = 13500; name = "Lote Tiny House (Moon)"; break;
      case "premium": unitPrice = 39000; name = "Lote Premium (Moon)"; break;
      case "dome_founder": unitPrice = 70000; name = "Paracas Dome Founder"; break;
      case "dome_comfort": unitPrice = 89000; name = "Paracas Dome Comfort"; break;
    }
    const totalSales = unitPrice * simQuantity;
    return {
      name,
      totalSales,
      commVendedor: totalSales * pctVendedor / 100,
      commGerente: totalSales * pctGerente / 100,
      commBonoMeta: totalSales * pctBonoMeta / 100,
      commBonoSem: totalSales * pctBonoSemestral / 100,
      commTotal: totalSales * totalPct / 100
    };
  }, [simQuantity, simProduct, pctGerente, pctVendedor, pctBonoMeta, pctBonoSemestral, totalPct]);

  // WhatsApp share
  const handleCopySimulation = () => {
    const text = `*🏝️ Moon Paracas - Simulación de Comisiones*\n` +
      `-----------------------------------------\n` +
      `📈 *Producto:* ${simulatedEarnings.name}\n` +
      `🔢 *Cantidad de Cierres:* ${simQuantity} venta(s)\n` +
      `💰 *Volumen de Ventas:* ${fmt(simulatedEarnings.totalSales)}\n` +
      `-----------------------------------------\n` +
      `🤝 *Comisión Vendedor (${pctVendedor}%):* ${fmt(simulatedEarnings.commVendedor)}\n` +
      `🏢 *Comisión Gerente (${pctGerente}%):* ${fmt(simulatedEarnings.commGerente)}\n` +
      `🎯 *Bono Meta Semanal (${pctBonoMeta}%):* ${fmt(simulatedEarnings.commBonoMeta)}\n` +
      `🏆 *Bono Semestral Top 3 (${pctBonoSemestral}%):* ${fmt(simulatedEarnings.commBonoSem)}\n` +
      `-----------------------------------------\n` +
      `💵 *TOTAL COMISIONES (${totalPct.toFixed(1)}%):* ${fmt(simulatedEarnings.commTotal)}`;
    navigator.clipboard.writeText(text);
    alert("Simulación copiada al portapapeles. ¡Listo para WhatsApp!");
  };

  // ----------------------------------------------------
  // SUB-PRODUCT: Moon Paracas State & Logics
  // ----------------------------------------------------
  const [moonFilter, setMoonFilter] = useState<string>("all");
  const [moonSearch, setMoonSearch] = useState("");
  const [moonSortCol, setMoonSortCol] = useState<string | null>(null);
  const [moonSortDir, setMoonSortDir] = useState<"asc" | "desc">("asc");

  const filteredMoonData = useMemo(() => {
    let d = [...moonData];

    switch (moonFilter) {
      case "lotes": d = d.filter(l => l.id.startsWith("L")); break;
      case "cocheras": d = d.filter(l => l.id.startsWith("P")); break;
      case "estandar": d = d.filter(l => l.tipologia.includes("Estándar")); break;
      case "tinyhouse": d = d.filter(l => l.tipologia.includes("Tiny")); break;
      case "premium": d = d.filter(l => l.tipologia.includes("Premium")); break;
      case "zen": d = d.filter(l => l.tipologia.includes("Zen")); break;
      case "irregular": d = d.filter(l => l.tipologia.includes("Irregular") || l.tipologia.includes("Ajuste")); break;
    }

    if (moonSearch) {
      const t = moonSearch.toLowerCase();
      d = d.filter(l =>
        l.id.toLowerCase().includes(t) ||
        l.nombre.toLowerCase().includes(t) ||
        l.manzana.toLowerCase().includes(t) ||
        l.tipologia.toLowerCase().includes(t) ||
        l.estado.toLowerCase().includes(t)
      );
    }

    if (moonSortCol) {
      d.sort((a, b) => {
        let va: any, vb: any;
        switch (moonSortCol) {
          case "precio": va = a.precio; vb = b.precio; break;
          case "total": va = a.precio * totalPct / 100; vb = b.precio * totalPct / 100; break;
          case "tipologia": va = a.tipologia; vb = b.tipologia; break;
          case "manzana": va = a.manzana; vb = b.manzana; break;
          default: va = a.id; vb = b.id;
        }
        if (typeof va === "string") return moonSortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        return moonSortDir === "asc" ? va - vb : vb - va;
      });
    }

    return d;
  }, [moonData, moonFilter, moonSearch, moonSortCol, moonSortDir, totalPct]);

  const moonTotals = useMemo(() => {
    const totalPrecio = filteredMoonData.reduce((s, l) => s + l.precio, 0);
    return {
      totalPrecio,
      totalGerente: +(totalPrecio * pctGerente / 100).toFixed(2),
      totalVendedor: +(totalPrecio * pctVendedor / 100).toFixed(2),
      totalBonoMeta: +(totalPrecio * pctBonoMeta / 100).toFixed(2),
      totalBonoSem: +(totalPrecio * pctBonoSemestral / 100).toFixed(2),
      totalComision: +(totalPrecio * totalPct / 100).toFixed(2),
    };
  }, [filteredMoonData, pctGerente, pctVendedor, pctBonoMeta, pctBonoSemestral, totalPct]);

  const handleMoonSort = (col: string) => {
    if (moonSortCol === col) setMoonSortDir(d => d === "asc" ? "desc" : "asc");
    else { setMoonSortCol(col); setMoonSortDir("asc"); }
  };

  const exportMoonCSV = () => {
    let csv = "\uFEFF";
    csv += `N°;ID;Nombre;Manzana;Tipología;Área m²;Precio S/;Estado;1.5% Gerente S/;5% Vendedor S/;2.5% Bono Meta S/;1% Bono Sem S/;% Total;Total Comisión S/\n`;
    filteredMoonData.forEach((item, i) => {
      const g = +(item.precio * pctGerente / 100).toFixed(2);
      const v = +(item.precio * pctVendedor / 100).toFixed(2);
      const bm = +(item.precio * pctBonoMeta / 100).toFixed(2);
      const bs = +(item.precio * pctBonoSemestral / 100).toFixed(2);
      const tc = +(item.precio * totalPct / 100).toFixed(2);
      csv += `${i + 1};${item.id};${item.nombre};${item.manzana};${item.tipologia};${item.area};${item.precio};${item.estado};${g};${v};${bm};${bs};${totalPct.toFixed(1)}%;${tc}\n`;
    });
    csv += `;;TOTALES;;;;${moonTotals.totalPrecio};;${moonTotals.totalGerente};${moonTotals.totalVendedor};${moonTotals.totalBonoMeta};${moonTotals.totalBonoSem};${totalPct.toFixed(1)}%;${moonTotals.totalComision}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Moon_Paracas_Comisiones_Lotes_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ----------------------------------------------------
  // SUB-PRODUCT: Paracas Dome State & Logics
  // ----------------------------------------------------
  const [domeOfferType, setDomeOfferType] = useState<"founder" | "comfort">("founder");
  const [domeFilter, setDomeFilter] = useState<string>("all");
  const [domeSearch, setDomeSearch] = useState("");
  const [domeSortCol, setDomeSortCol] = useState<string | null>(null);
  const [domeSortDir, setDomeSortDir] = useState<"asc" | "desc">("asc");

  const getDomePrice = (lot: DomeLot) => domeOfferType === "founder" ? lot.precioFounder : lot.precioComfort;
  const getDomeGanancia = (lot: DomeLot) => domeOfferType === "founder" ? lot.gananciaMinFounder : lot.gananciaMinComfort;

  const filteredDomeData = useMemo(() => {
    let d = [...domeData];

    switch (domeFilter) {
      case "premium": d = d.filter(l => l.tipologia === "Premium"); break;
      case "estandar": d = d.filter(l => l.tipologia === "Estándar"); break;
      case "fila1": d = d.filter(l => l.fila === "Fila 1"); break;
      case "fila2": d = d.filter(l => l.fila === "Fila 2"); break;
      case "fila3": d = d.filter(l => l.fila === "Fila 3"); break;
      case "fila4": d = d.filter(l => l.fila === "Fila 4"); break;
      case "fila5": d = d.filter(l => l.fila === "Fila 5"); break;
    }

    if (domeSearch) {
      const t = domeSearch.toLowerCase();
      d = d.filter(l =>
        l.id.toLowerCase().includes(t) ||
        l.nombre.toLowerCase().includes(t) ||
        l.fila.toLowerCase().includes(t) ||
        l.tipologia.toLowerCase().includes(t) ||
        l.estado.toLowerCase().includes(t)
      );
    }

    if (domeSortCol) {
      d.sort((a, b) => {
        let va: any, vb: any;
        switch (domeSortCol) {
          case "precio": va = getDomePrice(a); vb = getDomePrice(b); break;
          case "total": va = getDomePrice(a) * totalPct / 100; vb = getDomePrice(b) * totalPct / 100; break;
          case "ganancia": va = getDomeGanancia(a); vb = getDomeGanancia(b); break;
          case "fila": va = a.fila; vb = b.fila; break;
          default: va = a.id; vb = b.id;
        }
        if (typeof va === "string") return domeSortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
        return domeSortDir === "asc" ? va - vb : vb - va;
      });
    }

    return d;
  }, [domeData, domeFilter, domeSearch, domeSortCol, domeSortDir, totalPct, domeOfferType]);

  const domeTotals = useMemo(() => {
    const totalPrecio = filteredDomeData.reduce((s, l) => s + getDomePrice(l), 0);
    const totalCostoTerreno = filteredDomeData.reduce((s, l) => s + l.costoTerreno, 0);
    const totalInvDomo = filteredDomeData.reduce((s, l) => s + l.inversionMaxDomo, 0);
    const totalGanancia = filteredDomeData.reduce((s, l) => s + getDomeGanancia(l), 0);
    return {
      totalPrecio,
      totalCostoTerreno,
      totalInvDomo,
      totalGanancia,
      totalGerente: +(totalPrecio * pctGerente / 100).toFixed(2),
      totalVendedor: +(totalPrecio * pctVendedor / 100).toFixed(2),
      totalBonoMeta: +(totalPrecio * pctBonoMeta / 100).toFixed(2),
      totalBonoSem: +(totalPrecio * pctBonoSemestral / 100).toFixed(2),
      totalComision: +(totalPrecio * totalPct / 100).toFixed(2),
    };
  }, [filteredDomeData, pctGerente, pctVendedor, pctBonoMeta, pctBonoSemestral, totalPct, domeOfferType]);

  const handleDomeSort = (col: string) => {
    if (domeSortCol === col) setDomeSortDir(d => d === "asc" ? "desc" : "asc");
    else { setDomeSortCol(col); setDomeSortDir("asc"); }
  };

  const exportDomeCSV = () => {
    let csv = "\uFEFF";
    const offerLabel = domeOfferType === "founder" ? "Founder 50" : "Comfort 50";
    csv += `N°;ID;Nombre;Fila;Tipología;Área m²;Domo m²;Precio ${offerLabel} S/;Costo Terreno S/;Inv. Máx Domo S/;Ganancia Mín S/;Estado;${pctGerente}% Gerente S/;${pctVendedor}% Vendedor S/;${pctBonoMeta}% Bono Meta S/;${pctBonoSemestral}% Bono Sem S/;% Total;Total Comisión S/\n`;
    filteredDomeData.forEach((lot, i) => {
      const p = getDomePrice(lot);
      const g = +(p * pctGerente / 100).toFixed(2);
      const v = +(p * pctVendedor / 100).toFixed(2);
      const bm = +(p * pctBonoMeta / 100).toFixed(2);
      const bs = +(p * pctBonoSemestral / 100).toFixed(2);
      const tc = +(p * totalPct / 100).toFixed(2);
      csv += `${i + 1};${lot.id};${lot.nombre};${lot.fila};${lot.tipologia};${lot.areaM2};${lot.domoM2};${p};${lot.costoTerreno};${lot.inversionMaxDomo};${getDomeGanancia(lot)};${lot.estado};${g};${v};${bm};${bs};${totalPct.toFixed(1)}%;${tc}\n`;
    });
    csv += `;;TOTALES;;;;;;${domeTotals.totalPrecio};${domeTotals.totalCostoTerreno};${domeTotals.totalInvDomo};${domeTotals.totalGanancia};;${domeTotals.totalGerente};${domeTotals.totalVendedor};${domeTotals.totalBonoMeta};${domeTotals.totalBonoSem};${totalPct.toFixed(1)}%;${domeTotals.totalComision}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Paracas_Dome_Comisiones_${offerLabel.replace(" ", "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[#100C0A]/40 text-[#E1D9C1]">
      <div className="max-w-[1800px] mx-auto space-y-6">

        {/* Dynamic Glowing Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[#E1D9C1]/15 bg-gradient-to-br from-[#1D1714] to-[#100C0A]/80 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Calculator size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E2725B]/10 border border-[#E2725B]/30 text-[#E2725B] text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Portal de Brokerage Inmobiliario
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Simulador General de <span className="text-[#E2725B]">Comisiones</span>
              </h1>
              <p className="text-sm text-[#E1D9C1]/60 max-w-2xl">
                Configura los splits porcentuales, filtra las unidades del inventario central, registra trazabilidad de separaciones en vivo sincronizadas con Firebase Firestore, y simula tus cierres.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex flex-row gap-4 shrink-0 bg-[#100C0A]/40 p-4 border border-[#E1D9C1]/10 rounded-2xl">
              <div className="text-center px-4">
                <div className="text-[10px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Unidades Totales</div>
                <div className="text-xl font-black text-[#E2725B]">500</div>
              </div>
              <div className="w-px bg-[#E1D9C1]/15 my-1" />
              <div className="text-center px-4">
                <div className="text-[10px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Separaciones Activas</div>
                <div className="text-xl font-black text-amber-400">{reservationsLog.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Project Tab Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex bg-[#1D1714] border border-[#E1D9C1]/15 rounded-2xl p-1.5 shadow-2xl">
            <button
              onClick={() => setActiveTab("moon")}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "moon"
                  ? "bg-[#E2725B] text-white shadow-[0_0_20px_rgba(226,114,91,0.3)]"
                  : "text-[#E1D9C1]/40 hover:text-[#E1D9C1]/75"
              }`}
            >
              🏝️ Moon Paracas (Lotes y Cocheras)
            </button>
            <button
              onClick={() => setActiveTab("dome")}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "dome"
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : "text-[#E1D9C1]/40 hover:text-[#E1D9C1]/75"
              }`}
            >
              ⛺ Paracas Dome (Sub-producto)
            </button>
          </div>
        </div>

        {/* SECTION: 4 Editable Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Gerente Comercial", icon: <Building2 className="w-5 h-5" />, pct: pctGerente, setPct: setPctGerente, color: "from-amber-500/20 to-amber-600/5 border-amber-500/30", textColor: "text-amber-400", desc: "1.5% Ventas Globales" },
            { label: "Vendedor de Cierre", icon: <Users className="w-5 h-5" />, pct: pctVendedor, setPct: setPctVendedor, color: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30", textColor: "text-emerald-400", desc: "5.0% Directo al cierre" },
            { label: "Bono Meta Semanal", icon: <Target className="w-5 h-5" />, pct: pctBonoMeta, setPct: setPctBonoMeta, color: "from-blue-500/20 to-blue-600/5 border-blue-500/30", textColor: "text-blue-400", desc: "2.5% Repartido equipo" },
            { label: "Bono Semestral Top 3", icon: <Trophy className="w-5 h-5" />, pct: pctBonoSemestral, setPct: setPctBonoSemestral, color: "from-purple-500/20 to-purple-600/5 border-purple-500/30", textColor: "text-purple-400", desc: "1.0% Compartido Top 3" },
          ].map((card, i) => (
            <div key={i} className="relative bg-[#1d1714] border border-[#E1D9C1]/15 rounded-2xl p-5 hover:border-[#E2725B]/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className={`${card.textColor} opacity-85`}>{card.icon}</div>
                <div className="flex items-center gap-1.5">
                  <input 
                    type="number" 
                    value={card.pct} 
                    min="0"
                    max="15"
                    step="0.1"
                    onChange={(e) => card.setPct(parseFloat(e.target.value) || 0)}
                    className="w-12 bg-transparent text-right text-lg font-black border-b border-[#E1D9C1]/20 focus:border-[#E2725B] focus:outline-none text-[#E1D9C1]"
                  />
                  <span className="text-xs text-[#E1D9C1]/50 font-bold">%</span>
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white mb-0.5">{card.label}</div>
              <div className="text-[10px] text-[#E1D9C1]/50 mb-3">{card.desc}</div>

              {/* Slider bar */}
              <input
                type="range" min="0" max="15" step="0.1" value={card.pct}
                onChange={(e) => card.setPct(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#E1D9C1]/10 accent-[#E2725B]"
                style={{ background: `linear-gradient(to right, #E2725B ${(card.pct / 15) * 100}%, rgba(225,217,193,0.1) ${(card.pct / 15) * 100}%)` }}
              />

              <div className="flex justify-between text-[9px] text-[#E1D9C1]/30 font-mono mt-1"><span>0%</span><span>15%</span></div>
              <div className="flex gap-1 mt-2.5 flex-wrap">
                {[0.5, 1, 2.5, 5, 7.5, 10].map(v => (
                  <button key={v} onClick={() => card.setPct(v)}
                    className={`text-[9px] px-2 py-0.5 rounded-full border font-bold transition-all ${
                      Math.abs(card.pct - v) < 0.05
                        ? "border-[#E2725B] bg-[#E2725B]/20 text-[#E2725B]"
                        : "border-[#E1D9C1]/10 text-[#E1D9C1]/40 hover:border-[#E2725B]/50 hover:text-white"
                    }`}>{v}%</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* META & CLOSURE SIMULATOR */}
        <div className="border border-[#E1D9C1]/15 rounded-2xl bg-gradient-to-r from-[#1D1714] to-[#100C0A] p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp size={100} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#E2725B]" />
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Simulador de Metas y Cierres de Venta</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Product selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#E1D9C1]/50 uppercase font-bold tracking-wider">1. Seleccionar Producto</label>
                <select
                  value={simProduct}
                  onChange={(e: any) => setSimProduct(e.target.value)}
                  className="w-full px-4 py-3 bg-[#100C0A] border border-[#E1D9C1]/15 rounded-xl text-xs font-bold text-[#E1D9C1] focus:outline-none focus:border-[#E2725B]/50"
                >
                  <option value="standard">🏝️ Lote Estándar Moon (S/ 27,000)</option>
                  <option value="tiny">🏝️ Lote Tiny House Moon (S/ 13,500)</option>
                  <option value="premium">🏝️ Lote Premium Moon (S/ 39,000)</option>
                  <option value="dome_founder">⛺ Paracas Dome Founder (S/ 70,000)</option>
                  <option value="dome_comfort">⛺ Paracas Dome Comfort (S/ 89,000)</option>
                </select>
              </div>

              {/* Quantity input */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#E1D9C1]/50 uppercase font-bold tracking-wider">2. Número de Cierres (Lotes/Domos)</label>
                <div className="flex items-center bg-[#100C0A] border border-[#E1D9C1]/15 rounded-xl px-2 py-1">
                  <button 
                    onClick={() => setSimQuantity(q => Math.max(1, q - 1))}
                    className="p-2 text-lg text-[#E1D9C1]/40 hover:text-white font-bold"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={simQuantity} 
                    onChange={(e) => setSimQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center bg-transparent border-none focus:outline-none text-xs font-bold text-white"
                  />
                  <button 
                    onClick={() => setSimQuantity(q => q + 1)}
                    className="p-2 text-lg text-[#E1D9C1]/40 hover:text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Simulated Result Box */}
              <div className="bg-[#100C0A]/60 border border-[#E1D9C1]/10 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Comisión de Cierre Estimada</span>
                  <button 
                    onClick={handleCopySimulation}
                    className="p-1 rounded bg-[#1D1714] text-[#E1D9C1]/60 hover:text-white transition-colors"
                    title="Copiar simulación para Whatsapp"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">{fmt(simulatedEarnings.commVendedor)}</span>
                  <span className="text-[10px] text-[#E1D9C1]/40 font-mono">({pctVendedor}%)</span>
                </div>
                <div className="mt-2 text-[9px] text-[#E1D9C1]/50 flex justify-between">
                  <span>Ventas: {fmt(simulatedEarnings.totalSales)}</span>
                  <span>Bono Meta: {fmt(simulatedEarnings.commBonoMeta)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* TAB 1: MOON PARACAS VIEW */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === "moon" && (
          <div className="space-y-6">
            {/* Total global bar */}
            <div className="bg-gradient-to-r from-[#E2725B]/10 via-[#E2725B]/5 to-transparent border border-[#E2725B]/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#E2725B]/15 text-[#E2725B]">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#E1D9C1]/60">Suma Porcentajes de Comisión</div>
                  <div className="text-3xl font-black text-[#E2725B]">{totalPct.toFixed(1)}%</div>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center bg-[#100C0A]/40 px-4 py-2 border border-[#E1D9C1]/5 rounded-xl">
                  <div className="text-[9px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Valor Inventario</div>
                  <div className="text-base font-bold text-amber-400">{fmt(moonTotals.totalPrecio)}</div>
                </div>
                <div className="text-center bg-[#100C0A]/40 px-4 py-2 border border-[#E1D9C1]/5 rounded-xl">
                  <div className="text-[9px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Comisiones Totales</div>
                  <div className="text-base font-bold text-rose-400">{fmt(moonTotals.totalComision)}</div>
                </div>
                <div className="text-center bg-[#100C0A]/40 px-4 py-2 border border-[#E1D9C1]/5 rounded-xl">
                  <div className="text-[9px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Lotes/Cocheras</div>
                  <div className="text-base font-bold text-[#E1D9C1]">{filteredMoonData.length}</div>
                </div>
              </div>
              <button onClick={resetRates} className="text-[10px] text-[#E1D9C1]/50 hover:text-[#E2725B] border border-[#E1D9C1]/10 hover:border-[#E2725B]/40 px-4 py-2 rounded-xl transition-all font-bold uppercase tracking-wider">
                Restaurar Defaults
              </button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E1D9C1]/30" />
                <input
                  value={moonSearch}
                  onChange={(e) => setMoonSearch(e.target.value)}
                  placeholder="Buscar lote por ID, manzana, tipología..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1D1714] border border-[#E1D9C1]/15 rounded-xl text-sm text-[#E1D9C1] focus:border-[#E2725B]/50 focus:outline-none transition-all font-sans"
                />
                {moonSearch && (
                  <button onClick={() => setMoonSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-[#E1D9C1]/30 hover:text-[#E2725B]" />
                  </button>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {[
                  { key: "all", label: "Todos" },
                  { key: "lotes", label: "Lotes" },
                  { key: "cocheras", label: "Cocheras" },
                  { key: "estandar", label: "Estándar" },
                  { key: "tinyhouse", label: "Tiny House" },
                  { key: "premium", label: "Premium" },
                  { key: "zen", label: "Zen" },
                  { key: "irregular", label: "Irregular" }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setMoonFilter(f.key)}
                    className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                      moonFilter === f.key
                        ? "border-[#E2725B] text-[#E2725B] bg-[#E2725B]/10"
                        : "border-[#E1D9C1]/10 text-[#E1D9C1]/40 hover:border-[#E2725B]/40 hover:text-[#E1D9C1]/75"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button onClick={exportMoonCSV} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20">
                <Download className="w-4 h-4" /> Excel
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>

            {/* Table */}
            <div className="border border-[#E1D9C1]/10 rounded-2xl overflow-hidden bg-[#1D1714]/80 backdrop-blur-sm shadow-2xl">
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#100C0A] [&::-webkit-scrollbar-thumb]:bg-[#E1D9C1]/15 [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 z-10 bg-[#1D1714]">
                    <tr className="border-b-2 border-[#E2725B]/30">
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">#</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center cursor-pointer hover:text-[#E2725B]" onClick={() => handleMoonSort("id")}>ID {moonSortCol === "id" && (moonSortDir === "asc" ? "▲" : "▼")}</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/60 font-bold text-left">Nombre</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center cursor-pointer hover:text-[#E2725B]" onClick={() => handleMoonSort("manzana")}>Manzana {moonSortCol === "manzana" && (moonSortDir === "asc" ? "▲" : "▼")}</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-left cursor-pointer hover:text-[#E2725B]" onClick={() => handleMoonSort("tipologia")}>Tipología {moonSortCol === "tipologia" && (moonSortDir === "asc" ? "▲" : "▼")}</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">Área m²</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-amber-400 font-bold text-center cursor-pointer hover:text-amber-300" onClick={() => handleMoonSort("precio")}>Precio S/ {moonSortCol === "precio" && (moonSortDir === "asc" ? "▲" : "▼")}</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">Estado</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">Separar</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-amber-400/80 font-bold text-center">🏢 {pctGerente}%</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-emerald-400/80 font-bold text-center">🤝 {pctVendedor}%</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">% Total</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-rose-400 font-bold text-center cursor-pointer hover:text-rose-300" onClick={() => handleMoonSort("total")}>Total Com. S/ {moonSortCol === "total" && (moonSortDir === "asc" ? "▲" : "▼")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMoonData.map((lot, idx) => {
                      const g = +(lot.precio * pctGerente / 100).toFixed(2);
                      const v = +(lot.precio * pctVendedor / 100).toFixed(2);
                      const tc = +(lot.precio * totalPct / 100).toFixed(2);

                      return (
                        <tr 
                          key={lot.id} 
                          onClick={() => setSelectedLotDetail(lot)}
                          className={`border-b border-[#E1D9C1]/5 transition-all duration-150 hover:bg-[#E2725B]/10 cursor-pointer ${idx % 2 === 0 ? "bg-[#100C0A]/50" : "bg-[#1D1714]/30"}`}
                        >
                          <td className="py-2.5 px-3 text-center text-[#E1D9C1]/30 font-mono text-[10px]">{idx + 1}</td>
                          <td className="py-2.5 px-3 text-center text-[#E1D9C1]/60 font-mono text-[10px]">{lot.id}</td>
                          <td className="py-2.5 px-3 text-left text-[#E1D9C1] font-semibold">{lot.nombre}</td>
                          <td className="py-2.5 px-3 text-center text-[#E1D9C1]/50">{lot.manzana}</td>
                          <td className="py-2.5 px-3 text-left text-[#E1D9C1]/50 text-[10px]">{lot.tipologia}</td>
                          <td className="py-2.5 px-3 text-center text-[#E1D9C1]/40 font-mono">{lot.area}</td>
                          <td className="py-2.5 px-3 text-center text-amber-400 font-bold">{fmt(lot.precio)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${moonEstadoColor[lot.estado] || "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>
                              {lot.estado}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {lot.estado === "Separado" ? (
                              <span className="text-[10px] text-amber-400 font-bold">Separado 🔒</span>
                            ) : lot.estado === "Vendido" ? (
                              <span className="text-[10px] text-rose-400 font-bold">Vendido 🛑</span>
                            ) : (
                              <button
                                onClick={(e) => handleOpenReserveModal(lot.id, "Moon Paracas", e)}
                                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 hover:text-[#100C0A] border border-amber-500/40 rounded text-[9px] font-bold uppercase tracking-wider transition-all"
                              >
                                Separar
                              </button>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center text-amber-400/70 font-mono">{fmt(g)}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-400 font-bold font-mono">{fmt(v)}</td>
                          <td className="py-2.5 px-3 text-center text-rose-400 font-bold">{totalPct.toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-center text-rose-400 font-black text-xs">{fmt(tc)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-[#E2725B]/15 to-transparent border-t-2 border-[#E2725B]/40 font-black">
                      <td colSpan={6} className="py-3.5 px-3 text-right text-[#E1D9C1] text-xs uppercase tracking-wider">Totales Globales →</td>
                      <td className="py-3.5 px-3 text-center text-amber-400 text-sm">{fmt(moonTotals.totalPrecio)}</td>
                      <td colSpan={2}></td>
                      <td className="py-3.5 px-3 text-center text-amber-400 text-xs">{fmt(moonTotals.totalGerente)}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-400 text-xs">{fmt(moonTotals.totalVendedor)}</td>
                      <td className="py-3.5 px-3 text-center text-rose-400 text-sm">{totalPct.toFixed(1)}%</td>
                      <td className="py-3.5 px-3 text-center text-rose-400 text-sm">{fmt(moonTotals.totalComision)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-[#100C0A]/80 border-t border-[#E1D9C1]/5 text-[10px] text-[#E1D9C1]/30 font-bold uppercase tracking-wider">
                <span>Mostrando {filteredMoonData.length} de {moonData.length} elementos • Haz clic en una fila para ver el desglose</span>
                <span>Comisión total: {totalPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* TAB 2: PARACAS DOME VIEW */}
        {/* -------------------------------------------------------------------- */}
        {activeTab === "dome" && (
          <div className="space-y-6">
            {/* Offer Type Selection & Key Indicators */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="inline-flex bg-[#1D1714] border border-[#E1D9C1]/15 rounded-xl p-1 shadow-2xl">
                <button
                  onClick={() => setDomeOfferType("founder")}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    domeOfferType === "founder"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "text-[#E1D9C1]/40 hover:text-[#E1D9C1]/75"
                  }`}
                >
                  Founder 50 (S/ 70,000)
                </button>
                <button
                  onClick={() => setDomeOfferType("comfort")}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    domeOfferType === "comfort"
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                      : "text-[#E1D9C1]/40 hover:text-[#E1D9C1]/75"
                  }`}
                >
                  Comfort 50 (S/ 89,000)
                </button>
              </div>

              {/* Indicators */}
              <div className="flex flex-wrap gap-4 text-xs font-bold font-mono">
                <div className="bg-[#1D1714]/85 border border-[#E1D9C1]/10 rounded-xl px-4 py-2">
                  <span className="text-[#E1D9C1]/40 mr-2 uppercase text-[9px]">Costo Terreno:</span>
                  <span className="text-rose-400">{fmt(10000)}</span>
                </div>
                <div className="bg-[#1D1714]/85 border border-[#E1D9C1]/10 rounded-xl px-4 py-2">
                  <span className="text-[#E1D9C1]/40 mr-2 uppercase text-[9px]">Límite Domo:</span>
                  <span className="text-blue-400">{fmt(35000)}</span>
                </div>
                <div className="bg-[#1D1714]/85 border border-[#E1D9C1]/10 rounded-xl px-4 py-2">
                  <span className="text-[#E1D9C1]/40 mr-2 uppercase text-[9px]">Ganancia x Domo:</span>
                  <span className="text-emerald-400 font-black">{fmt(domeOfferType === "founder" ? 25000 : 44000)}</span>
                </div>
              </div>
            </div>

            {/* Total global bar */}
            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#E1D9C1]/60">Suma Porcentajes de Comisión</div>
                  <div className="text-3xl font-black text-emerald-400">{totalPct.toFixed(1)}%</div>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center bg-[#100C0A]/40 px-4 py-2 border border-[#E1D9C1]/5 rounded-xl">
                  <div className="text-[9px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Valor Inventario</div>
                  <div className="text-base font-bold text-amber-400">{fmt(domeTotals.totalPrecio)}</div>
                </div>
                <div className="text-center bg-[#100C0A]/40 px-4 py-2 border border-[#E1D9C1]/5 rounded-xl">
                  <div className="text-[9px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Comisiones Totales</div>
                  <div className="text-base font-bold text-rose-400">{fmt(domeTotals.totalComision)}</div>
                </div>
                <div className="text-center bg-[#100C0A]/40 px-4 py-2 border border-[#E1D9C1]/5 rounded-xl">
                  <div className="text-[9px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Ganancia Neta Total</div>
                  <div className="text-base font-bold text-emerald-400">{fmt(domeTotals.totalGanancia)}</div>
                </div>
                <div className="text-center bg-[#100C0A]/40 px-4 py-2 border border-[#E1D9C1]/5 rounded-xl">
                  <div className="text-[9px] text-[#E1D9C1]/40 uppercase tracking-widest font-bold">Macro-Lotes</div>
                  <div className="text-base font-bold text-[#E1D9C1]">{filteredDomeData.length}</div>
                </div>
              </div>
              <button onClick={resetRates} className="text-[10px] text-[#E1D9C1]/50 hover:text-emerald-400 border border-[#E1D9C1]/10 hover:border-emerald-400/40 px-4 py-2 rounded-xl transition-all font-bold uppercase tracking-wider">
                Restaurar Defaults
              </button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E1D9C1]/30" />
                <input
                  value={domeSearch}
                  onChange={(e) => setDomeSearch(e.target.value)}
                  placeholder="Buscar domo por ID, fila o estado..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1D1714] border border-[#E1D9C1]/15 rounded-xl text-sm text-[#E1D9C1] focus:border-emerald-500/50 focus:outline-none transition-all font-sans"
                />
                {domeSearch && (
                  <button onClick={() => setDomeSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-[#E1D9C1]/30 hover:text-emerald-400" />
                  </button>
                )}
              </div>
              <div className="flex gap-1 flex-wrap">
                {[
                  { key: "all", label: "Todos" },
                  { key: "premium", label: "Premium" },
                  { key: "estandar", label: "Estándar" },
                  { key: "fila1", label: "Fila 1" },
                  { key: "fila2", label: "Fila 2" },
                  { key: "fila3", label: "Fila 3" },
                  { key: "fila4", label: "Fila 4" },
                  { key: "fila5", label: "Fila 5" }
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setDomeFilter(f.key)}
                    className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                      domeFilter === f.key
                        ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                        : "border-[#E1D9C1]/10 text-[#E1D9C1]/40 hover:border-emerald-500/40 hover:text-[#E1D9C1]/75"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button onClick={exportDomeCSV} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20">
                <Download className="w-4 h-4" /> Excel
              </button>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-600/20">
                <Printer className="w-4 h-4" /> Imprimir
              </button>
            </div>

            {/* Table */}
            <div className="border border-[#E1D9C1]/10 rounded-2xl overflow-hidden bg-[#1D1714]/80 backdrop-blur-sm shadow-2xl">
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#100C0A] [&::-webkit-scrollbar-thumb]:bg-[#E1D9C1]/15 [&::-webkit-scrollbar-thumb]:rounded-full">
                <table className="w-full text-[11px]">
                  <thead className="sticky top-0 z-10 bg-[#1D1714]">
                    <tr className="border-b-2 border-emerald-500/30">
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">#</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center cursor-pointer hover:text-emerald-400" onClick={() => handleDomeSort("id")}>ID {domeSortCol === "id" && (domeSortDir === "asc" ? "▲" : "▼")}</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/60 font-bold text-left">Nombre</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center cursor-pointer hover:text-emerald-400" onClick={() => handleDomeSort("fila")}>Fila {domeSortCol === "fila" && (domeSortDir === "asc" ? "▲" : "▼")}</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">Tipología</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">Área m²</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-amber-400 font-bold text-center cursor-pointer hover:text-amber-300" onClick={() => handleDomeSort("precio")}>Precio S/ {domeSortCol === "precio" && (domeSortDir === "asc" ? "▲" : "▼")}</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-rose-400/60 font-bold text-center">Terreno</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-blue-400/60 font-bold text-center">Inv. Domo</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-emerald-400 font-bold text-center cursor-pointer hover:text-emerald-300" onClick={() => handleDomeSort("ganancia")}>Ganancia {domeSortCol === "ganancia" && (domeSortDir === "asc" ? "▲" : "▼")}</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">Estado</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-[#E1D9C1]/40 font-bold text-center">Separar</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-amber-400/80 font-bold text-center">🏢 {pctGerente}%</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-emerald-400/80 font-bold text-center">🤝 {pctVendedor}%</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-rose-400 font-bold text-center">% Total</th>
                      <th className="py-3 px-3 text-[9px] uppercase tracking-widest text-rose-400 font-bold text-center cursor-pointer hover:text-rose-300" onClick={() => handleDomeSort("total")}>Total Com. S/ {domeSortCol === "total" && (domeSortDir === "asc" ? "▲" : "▼")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDomeData.map((lot, idx) => {
                      const p = getDomePrice(lot);
                      const g = +(p * pctGerente / 100).toFixed(2);
                      const v = +(p * pctVendedor / 100).toFixed(2);
                      const tc = +(p * totalPct / 100).toFixed(2);
                      const ganancia = getDomeGanancia(lot);

                      return (
                        <tr 
                          key={lot.id} 
                          onClick={() => setSelectedDomeDetail(lot)}
                          className={`border-b border-[#E1D9C1]/5 transition-all duration-150 hover:bg-emerald-500/10 cursor-pointer ${
                            idx % 2 === 0 ? "bg-[#100C0A]/50" : "bg-[#1D1714]/30"
                          } ${lot.tipologia === "Premium" ? "border-l-2 border-l-emerald-600/40" : ""}`}
                        >
                          <td className="py-2.5 px-3 text-center text-[#E1D9C1]/30 font-mono text-[10px]">{idx + 1}</td>
                          <td className="py-2.5 px-3 text-center text-[#E1D9C1]/60 font-mono text-[10px] font-bold">{lot.id}</td>
                          <td className="py-2.5 px-3 text-left text-[#E1D9C1] font-semibold">{lot.nombre}</td>
                          <td className="py-2.5 px-3 text-center text-[#E1D9C1]/50">{lot.fila}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              lot.tipologia === "Premium"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-[#E1D9C1]/5 text-[#E1D9C1]/50 border-[#E1D9C1]/15"
                            }`}>{lot.tipologia}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-[#E1D9C1]/40 font-mono">{lot.areaM2.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-center text-amber-400 font-bold">{fmt(p)}</td>
                          <td className="py-2.5 px-3 text-center text-rose-400/60 font-mono">{fmt(lot.costoTerreno)}</td>
                          <td className="py-2.5 px-3 text-center text-blue-400/60 font-mono">{fmt(lot.inversionMaxDomo)}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">{fmt(ganancia)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${moonEstadoColor[lot.estado] || "bg-gray-500/10 text-gray-400 border-gray-500/30"}`}>
                              {lot.estado}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {lot.estado === "Separado" ? (
                              <span className="text-[10px] text-amber-400 font-bold">Separado 🔒</span>
                            ) : lot.estado === "Vendido" ? (
                              <span className="text-[10px] text-rose-400 font-bold">Vendido 🛑</span>
                            ) : (
                              <button
                                onClick={(e) => handleOpenReserveModal(lot.id, "Paracas Dome", e)}
                                className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 hover:text-[#100C0A] border border-emerald-500/40 rounded text-[9px] font-bold uppercase tracking-wider transition-all"
                              >
                                Separar
                              </button>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center text-amber-400/70 font-mono">{fmt(g)}</td>
                          <td className="py-2.5 px-3 text-center text-emerald-400 font-bold font-mono">{fmt(v)}</td>
                          <td className="py-2.5 px-3 text-center text-rose-400 font-bold">{totalPct.toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-center text-rose-400 font-black text-xs">{fmt(tc)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-emerald-500/15 to-transparent border-t-2 border-emerald-500/40 font-black">
                      <td colSpan={6} className="py-3.5 px-3 text-right text-[#E1D9C1] text-xs uppercase tracking-wider">Totales →</td>
                      <td className="py-3.5 px-3 text-center text-amber-400 text-sm">{fmt(domeTotals.totalPrecio)}</td>
                      <td className="py-3.5 px-3 text-center text-rose-400/70 text-xs">{fmt(domeTotals.totalCostoTerreno)}</td>
                      <td className="py-3.5 px-3 text-center text-blue-400/70 text-xs">{fmt(domeTotals.totalInvDomo)}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-400 text-sm">{fmt(domeTotals.totalGanancia)}</td>
                      <td colSpan={2}></td>
                      <td className="py-3.5 px-3 text-center text-amber-400 text-xs">{fmt(domeTotals.totalGerente)}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-400 text-xs">{fmt(domeTotals.totalVendedor)}</td>
                      <td className="py-3.5 px-3 text-center text-rose-400 text-sm">{totalPct.toFixed(1)}%</td>
                      <td className="py-3.5 px-3 text-center text-rose-400 text-sm">{fmt(domeTotals.totalComision)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5 bg-[#100C0A]/80 border-t border-[#E1D9C1]/5 text-[10px] text-[#E1D9C1]/30 font-bold uppercase tracking-wider">
                <span>Mostrando {filteredDomeData.length} de {domeData.length} macro-lotes • Haz clic en una fila para ver el desglose</span>
                <span>Comisión total: {totalPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* PANEL: BITÁCORA DE TRAZABILIDAD (Firestore synchronized) */}
        {/* -------------------------------------------------------------------- */}
        <div className="border border-[#E1D9C1]/15 rounded-3xl bg-[#1D1714]/65 backdrop-blur-md p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-sm font-black uppercase text-white tracking-wider">Bitácora de Trazabilidad de Separaciones (Firebase Live)</h2>
                <p className="text-[10px] text-[#E1D9C1]/40">Registro en tiempo real de lotes apartados. Los cambios se sincronizan en vivo con la base de datos central.</p>
              </div>
            </div>
            {reservationsLog.length > 0 && (
              <button 
                onClick={handleClearAllSeparations}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/35 text-rose-400 text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Liberar Todo
              </button>
            )}
          </div>

          {reservationsLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 border border-[#E1D9C1]/5 rounded-2xl bg-[#100C0A]/20">
              <Info className="w-8 h-8 text-[#E1D9C1]/20" />
              <p className="text-xs text-[#E1D9C1]/40 font-medium">Ningún terreno ha sido separado todavía en la base de datos central.</p>
              <p className="text-[10px] text-[#E1D9C1]/30">Presiona el botón "Separar" en la lista de lotes o domos para registrar una separación con trazabilidad centralizada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E1D9C1]/10 rounded-2xl bg-[#100C0A]/40">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-[#100C0A]/80 border-b border-[#E1D9C1]/10 text-[#E1D9C1]/40 text-[9px] uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-4">Unidad</th>
                    <th className="py-2.5 px-4">Proyecto</th>
                    <th className="py-2.5 px-4">Separado por (Broker / Cliente)</th>
                    <th className="py-2.5 px-4">Monto Separación</th>
                    <th className="py-2.5 px-4">Fecha y Hora</th>
                    <th className="py-2.5 px-4 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {reservationsLog.map((log) => (
                    <tr key={log.id} className="border-b border-[#E1D9C1]/5 hover:bg-[#E1D9C1]/5 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{log.lotId}</td>
                      <td className="py-2.5 px-4">{log.proyecto}</td>
                      <td className="py-2.5 px-4 font-semibold text-white">{log.clienteName}</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">{fmt(log.montoSeparacion)}</td>
                      <td className="py-2.5 px-4 text-[#E1D9C1]/60">{log.fecha}</td>
                      <td className="py-2.5 px-4 text-center">
                        <button 
                          onClick={() => handleReleaseReservation(log)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 text-[9px] font-bold uppercase transition-all"
                        >
                          Liberar Lote
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* MODAL: SEPARAR TERRENO */}
        {/* -------------------------------------------------------------------- */}
        {reserveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1D1714] border border-[#E1D9C1]/20 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative animate-fade-in">
              <button 
                onClick={() => setReserveModalOpen(false)}
                className="absolute top-4 right-4 text-[#E1D9C1]/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-[#E1D9C1]/10 pb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Separar Unidad Manual</h3>
                    <span className="text-[10px] text-[#E1D9C1]/50 font-bold uppercase">Lote: {targetLotId} • {targetProyecto}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#E1D9C1]/50 uppercase font-bold tracking-wider">¿Quién separa? (Nombre de Asesor o Cliente)</label>
                    <input 
                      type="text"
                      placeholder="Ej. Juan Pérez / Broker Inmobiliario"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#100C0A] border border-[#E1D9C1]/15 rounded-xl text-xs text-[#E1D9C1] focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#E1D9C1]/50 uppercase font-bold tracking-wider">Monto de Separación (S/)</label>
                    <input 
                      type="number"
                      value={reservationAmount}
                      onChange={(e) => setReservationAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-3 bg-[#100C0A] border border-[#E1D9C1]/15 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setReserveModalOpen(false)}
                    className="flex-1 py-3 border border-[#E1D9C1]/10 hover:border-[#E1D9C1]/30 rounded-xl text-xs font-bold uppercase tracking-wider text-[#E1D9C1]/70 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmReservation}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-[#100C0A] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Confirmar Separación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* DETAIL DRAWER / MODAL: MOON PARACAS */}
        {/* -------------------------------------------------------------------- */}
        {selectedLotDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-[#1D1714] border border-[#E1D9C1]/20 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-fade-in">
              <button 
                onClick={() => setSelectedLotDetail(null)}
                className="absolute top-4 right-4 text-[#E1D9C1]/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-[#E1D9C1]/10 pb-4">
                  <div className="p-2.5 rounded-lg bg-[#E2725B]/10 text-[#E2725B]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedLotDetail.nombre}</h3>
                    <span className="text-[10px] text-[#E1D9C1]/50 font-bold uppercase">ID: {selectedLotDetail.id} • {selectedLotDetail.tipologia}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#E1D9C1]/40 uppercase text-[9px] font-bold">Manzana</span>
                    <div className="text-[#E1D9C1] font-bold">{selectedLotDetail.manzana}</div>
                  </div>
                  <div>
                    <span className="text-[#E1D9C1]/40 uppercase text-[9px] font-bold">Área Asignada</span>
                    <div className="text-[#E1D9C1] font-bold">{selectedLotDetail.area} m²</div>
                  </div>
                  <div>
                    <span className="text-[#E1D9C1]/40 uppercase text-[9px] font-bold">Precio Público</span>
                    <div className="text-amber-400 font-extrabold">{fmt(selectedLotDetail.precio)}</div>
                  </div>
                  <div>
                    <span className="text-[#E1D9C1]/40 uppercase text-[9px] font-bold">Estado</span>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${moonEstadoColor[selectedLotDetail.estado]}`}>
                        {selectedLotDetail.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E1D9C1]/10 pt-4 space-y-2">
                  <span className="text-[10px] text-[#E1D9C1]/40 uppercase font-bold tracking-wider">Desglose de Comisiones ({totalPct.toFixed(1)}%)</span>
                  {[
                    { label: "Vendedor de Cierre", pct: pctVendedor, value: selectedLotDetail.precio * pctVendedor / 100, color: "text-emerald-400" },
                    { label: "Gerente Comercial", pct: pctGerente, value: selectedLotDetail.precio * pctGerente / 100, color: "text-amber-400" },
                    { label: "Bono Meta Semanal", pct: pctBonoMeta, value: selectedLotDetail.precio * pctBonoMeta / 100, color: "text-blue-400" },
                    { label: "Bono Semestral Top 3", pct: pctBonoSemestral, value: selectedLotDetail.precio * pctBonoSemestral / 100, color: "text-purple-400" },
                  ].map((c, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-[#E1D9C1]/5 last:border-none">
                      <span className="text-[#E1D9C1]/60">{c.label} ({c.pct}%)</span>
                      <span className={`font-bold ${c.color}`}>{fmt(c.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm font-black pt-2 text-[#E2725B]">
                    <span>Total Comisión</span>
                    <span>{fmt(selectedLotDetail.precio * totalPct / 100)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const text = `*🏝️ Moon Paracas - Ficha de Payout*\nLote: ${selectedLotDetail.nombre} (ID: ${selectedLotDetail.id})\nPrecio: ${fmt(selectedLotDetail.precio)}\nComisión Vendedor: ${fmt(selectedLotDetail.precio * pctVendedor / 100)} (${pctVendedor}%)\nTotal Comisiones: ${fmt(selectedLotDetail.precio * totalPct / 100)} (${totalPct}%)`;
                      navigator.clipboard.writeText(text);
                      alert("Copiado al portapapeles");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#E2725B] hover:bg-[#d85e45] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copiar Ficha
                  </button>
                  {selectedLotDetail.estado !== "Separado" && selectedLotDetail.estado !== "Vendido" && (
                    <button
                      onClick={(e) => handleOpenReserveModal(selectedLotDetail.id, "Moon Paracas", e)}
                      className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-[#100C0A] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Separar Lote
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* DETAIL DRAWER / MODAL: PARACAS DOME */}
        {/* -------------------------------------------------------------------- */}
        {selectedDomeDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="bg-[#1D1714] border border-[#E1D9C1]/20 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-fade-in">
              <button 
                onClick={() => setSelectedDomeDetail(null)}
                className="absolute top-4 right-4 text-[#E1D9C1]/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3 border-b border-[#E1D9C1]/10 pb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Tent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedDomeDetail.nombre}</h3>
                    <span className="text-[10px] text-[#E1D9C1]/50 font-bold uppercase">ID: {selectedDomeDetail.id} • {selectedDomeDetail.tipologia}</span>
                  </div>
                </div>

                {/* Financial breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] text-[#E1D9C1]/40 uppercase font-bold tracking-wider">Estructura de Margen y Costos</span>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-[#100C0A]/40 p-3 rounded-xl border border-[#E1D9C1]/5">
                    <div>
                      <span className="text-[#E1D9C1]/40 text-[9px] uppercase">Precio Venta ({domeOfferType === "founder" ? "Founder" : "Comfort"})</span>
                      <div className="text-amber-400 font-extrabold">{fmt(getDomePrice(selectedDomeDetail))}</div>
                    </div>
                    <div>
                      <span className="text-[#E1D9C1]/40 text-[9px] uppercase">Terreno Bruto</span>
                      <div className="text-rose-400 font-bold">{fmt(selectedDomeDetail.costoTerreno)}</div>
                    </div>
                    <div>
                      <span className="text-[#E1D9C1]/40 text-[9px] uppercase">Inversión Máx Domo</span>
                      <div className="text-blue-400 font-bold">{fmt(selectedDomeDetail.inversionMaxDomo)}</div>
                    </div>
                    <div>
                      <span className="text-[#E1D9C1]/40 text-[9px] uppercase">Ganancia Neta</span>
                      <div className="text-emerald-400 font-extrabold">{fmt(getDomeGanancia(selectedDomeDetail))}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E1D9C1]/10 pt-4 space-y-2">
                  <span className="text-[10px] text-[#E1D9C1]/40 uppercase font-bold tracking-wider">Desglose de Comisiones ({totalPct.toFixed(1)}%)</span>
                  {[
                    { label: "Vendedor de Cierre", pct: pctVendedor, value: getDomePrice(selectedDomeDetail) * pctVendedor / 100, color: "text-emerald-400" },
                    { label: "Gerente Comercial", pct: pctGerente, value: getDomePrice(selectedDomeDetail) * pctGerente / 100, color: "text-amber-400" },
                    { label: "Bono Meta Semanal", pct: pctBonoMeta, value: getDomePrice(selectedDomeDetail) * pctBonoMeta / 100, color: "text-blue-400" },
                    { label: "Bono Semestral Top 3", pct: pctBonoSemestral, value: getDomePrice(selectedDomeDetail) * pctBonoSemestral / 100, color: "text-purple-400" },
                  ].map((c, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-[#E1D9C1]/5 last:border-none">
                      <span className="text-[#E1D9C1]/60">{c.label} ({c.pct}%)</span>
                      <span className={`font-bold ${c.color}`}>{fmt(c.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-sm font-black pt-2 text-[#E2725B]">
                    <span>Total Comisión</span>
                    <span>{fmt(getDomePrice(selectedDomeDetail) * totalPct / 100)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const price = getDomePrice(selectedDomeDetail);
                      const text = `*⛺ Paracas Dome - Ficha Domo*\nDomo: ${selectedDomeDetail.nombre} (ID: ${selectedDomeDetail.id})\nPrecio: ${fmt(price)}\nGanancia Neta Lote: ${fmt(getDomeGanancia(selectedDomeDetail))}\nComisión Vendedor: ${fmt(price * pctVendedor / 100)} (${pctVendedor}%)\nTotal Comisiones: ${fmt(price * totalPct / 100)} (${totalPct}%)`;
                      navigator.clipboard.writeText(text);
                      alert("Copiado al portapapeles");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copiar Ficha
                  </button>
                  {selectedDomeDetail.estado !== "Separado" && selectedDomeDetail.estado !== "Vendido" && (
                    <button
                      onClick={(e) => handleOpenReserveModal(selectedDomeDetail.id, "Paracas Dome", e)}
                      className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-[#100C0A] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Separar Domo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
