define i64 @plus_8192(i64 %x) {
  %sum = add i64 %x, 8192
  ret i64 %sum
}

define i64 @plus_8193(i64 %x) {
  %sum = add i64 %x, 8193
  ret i64 %sum
}

define i64 @plus_16773120(i64 %x) {
  %sum = add i64 %x, 16773120
  ret i64 %sum
}

define i64 @plus_16777216(i64 %x) {
  %sum = add i64 %x, 16777216
  ret i64 %sum
}
