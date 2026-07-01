$addresses = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -ne '127.0.0.1' -and
        $_.IPAddress -notlike '169.254.*' -and
        $_.IPAddress -notlike '172.*' -and
        $_.IPAddress -notlike '10.*'
    } |
    Sort-Object InterfaceIndex |
    Select-Object -ExpandProperty IPAddress -First 1

if (-not $addresses) {
    $addresses = Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -ne '127.0.0.1' -and
            $_.IPAddress -notlike '169.254.*'
        } |
        Sort-Object InterfaceIndex |
        Select-Object -ExpandProperty IPAddress -First 1
}

if ($addresses) {
    Write-Output $addresses
} else {
    Write-Output '127.0.0.1'
}
